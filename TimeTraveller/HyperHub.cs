using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using TimeTraveller.Models;

namespace TimeTraveller
{
    public class HyperHub : Hub
    {
        private readonly static ConnectionMapping _connections =
            new ConnectionMapping();


        public override Task OnConnected()
        {
            string username = Context.User.Identity.GetUserId();
            if (!_connections.IsExist(username))
            {
                UpdateUserConnection(username);

                GetMyUsage();
            }

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string username = Context.User.Identity.GetUserId();

            _connections.Remove(username);

            UserListChanged();

            return base.OnDisconnected(stopCalled);
        }

        private void UserListChanged()
        {
            var ctx = ApplicationDbContext.Create();
            // need total emmissions for all users
            var totalEmission = 
            Clients.All.userListChanged(JsonConvert.SerializeObject(_connections.GetConnections()));            
        }

        public override Task OnReconnected()
        {
            string username = Context.User.Identity.GetUserId();

            if (!_connections.IsExist(username))
            {
                UpdateUserConnection(username);

                GetMyUsage();
            }

            UserListChanged();

            return base.OnReconnected();
        }

        public void UpdateUserConnection(string username)
        {
            var user = new User
            {
                Username = username,
                Fullname = "",
                Latitude = -33.8809044,
                Longitude = 151.20046760000002
            };

            var ctx = ApplicationDbContext.Create();
            var usage = ctx.UserUsages
                .Where(u => u.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase))
                .GroupBy(u => u.Username)
                .Select(u => u.Sum(v => v.Emission))
                .ToList().FirstOrDefault();

            if (usage != null)
            {
                user.Emission = usage;
            }

            _connections.Add(user);            
        }

        public void UpdateLocation(double latitude, double longitude)
        {
            if ((int)latitude == 0) return;

            string username = Context.User.Identity.GetUserId();
            var user = _connections.Get(username);
            if (user != null)
            {
                user.Latitude = latitude;
                user.Longitude = longitude;
                _connections.Update(user);
            }

            UserListChanged();
        }

        public void Disconnect()
        {
            string username = Context.User.Identity.GetUserId();

            _connections.Remove(username);

            UserListChanged();
        }

        public void GetMyUsage()
        {
            string username = Context.User.Identity.GetUserId();
            var ctx = ApplicationDbContext.Create();
            var usage = ctx.UserUsages.Where(u => u.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase)).ToList();
            Clients.Caller.getMyUsage(JsonConvert.SerializeObject(usage));
        }

        public void RemoveUsage(int id)
        {
            try
            {
                string username = Context.User.Identity.GetUserId();
                var ctx = ApplicationDbContext.Create();
                var usage =
                    ctx.UserUsages.FirstOrDefault(
                        u => u.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase) && u.Id == id);
                if (usage != null)
                {
                    var oldEmission = usage.Emission;
                    usage.Quantity = 0;
                    CalculateEmission(usage, oldEmission);
                    ctx.UserUsages.Remove(usage);
                }


                ctx.SaveChanges();
            }
            catch (Exception ex)
            {

            }
            finally
            {
                GetMyUsage();
                UserListChanged();
            }
        }

        public void AddUsage(string product, int quantity)
        {
            try
            {
                string username = Context.User.Identity.GetUserId();
                var ctx = ApplicationDbContext.Create();
                var usage = ctx.UserUsages.FirstOrDefault(u => u.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase) && u.Product.Equals(product, StringComparison.InvariantCultureIgnoreCase));

                if (usage == null)
                {                    
                    Random rand = new Random();
                    usage = new UserUsage
                    {
                        Username = username,
                        Emission = 0,
                        Product = product,
                        Quantity = quantity
                    };

                    CalculateEmission(usage, 0);

                    ctx.UserUsages.Add(usage);
                }
                else
                {
                    var oldEmission = usage.Emission;
                    usage.Quantity = quantity;
                    CalculateEmission(usage, oldEmission);
                }

                ctx.SaveChanges();
            }
            catch (Exception ex)
            {                                
            }
            finally
            {
                GetMyUsage();
                UserListChanged();
            }
        }

        private void CalculateEmission(UserUsage usage, decimal oldEmission)
        {
            var rand = new Random();
            usage.Emission = usage.Quantity * rand.Next(10, 100);

            // update user emission
            string username = Context.User.Identity.GetUserId();
            var user = _connections.Get(username);
            if (user != null)
            {
                user.Emission -= oldEmission;
                user.Emission += usage.Emission;
                _connections.Update(user);
            }
        }


        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.broadcastMessage(name, message);
        }
    }
}