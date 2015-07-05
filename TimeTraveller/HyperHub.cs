using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using TimeTraveller.Models;

namespace TimeTraveller
{
    public class HyperHub : Hub
    {
        private static readonly ConnectionMapping _connections =
            new ConnectionMapping();

        public override Task OnConnected()
        {
            try
            {
                var username = Context.User.Identity.GetUserId();
                if (!_connections.IsExist(username))
                {
                    UpdateUserConnection(username);

                    GetMyUsage();
                    UserListChanged();
                }
            }
            catch
            {
            }

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            try
            {
                var username = Context.User.Identity.GetUserId();

                _connections.Remove(username);

                UserListChanged();
            }
            catch
            {
            }


            return base.OnDisconnected(stopCalled);
        }

        private void UserListChanged()
        {
            var ctx = ApplicationDbContext.Create();
            // need total emmissions for all users
            var users = ctx.Users.ToList();
            var connections = users.Select(usr => new User
            {
                Username = usr.UserName,
                Emission = usr.Emission,
                Latitude = (usr.Latitude == 0) ? -33.8809044 : usr.Latitude,
                Longitude = (usr.Longitude == 0) ? 151.20046760000002 : usr.Longitude,
                Fullname = ""
            }).ToList();

            Clients.All.userListChanged(JsonConvert.SerializeObject(connections));
        }

        public override Task OnReconnected()
        {
            try
            {
                var username = Context.User.Identity.GetUserId();

                if (!_connections.IsExist(username))
                {
                    UpdateUserConnection(username);

                    GetMyUsage();
                }

                UserListChanged();
            }
            catch
            {
            }

            return base.OnReconnected();
        }

        public void UpdateUserConnection(string username)
        {
            var user = new User
            {
                Username = username,
                Fullname = "",
                Emission = 0,
                //Latitude = 0,
                //Longitude = 0
                Latitude = -33.8809044,
                Longitude = 151.20046760000002
            };

            try
            {
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

                var appUser =
                    ctx.Users
                        .FirstOrDefault(u => u.Id.ToString().Equals(username, StringComparison.InvariantCultureIgnoreCase));

                if (appUser != null)
                {
                    appUser.Latitude = user.Latitude;
                    appUser.Longitude = user.Longitude;
                    appUser.Emission = user.Emission;
                    ctx.SaveChanges();
                }
            }
            catch
            {
            }

            _connections.Add(user);
        }

        public void UpdateLocation(double latitude, double longitude)
        {
            try
            {
                if ((int) latitude == 0) return;


                var username = Context.User.Identity.GetUserId();
                var user = _connections.Get(username);
                if (user != null)
                {
                    user.Latitude = latitude;
                    user.Longitude = longitude;
                    _connections.Update(user);
                }

                UserListChanged();
            }
            catch
            {
            }
        }

        public void Disconnect()
        {
            try
            {
                var username = Context.User.Identity.GetUserId();

                _connections.Remove(username);

                UserListChanged();
            }
            catch
            {
            }
        }

        public void GetMyUsage()
        {
            try
            {
                var username = Context.User.Identity.GetUserId();
                var ctx = ApplicationDbContext.Create();
                var usage =
                    ctx.UserUsages.Where(u => u.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase))
                        .ToList();
                Clients.Caller.getMyUsage(JsonConvert.SerializeObject(usage));
            }
            catch
            {
            }
        }

        public decimal RemoveUsage(int id)
        {
            decimal finalEmission = 0;
            try
            {
                var username = Context.User.Identity.GetUserId();
                var ctx = ApplicationDbContext.Create();
                var usage =
                    ctx.UserUsages.FirstOrDefault(
                        u => u.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase) && u.Id == id);
                if (usage != null)
                {
                    var oldEmission = usage.Emission;
                    usage.Quantity = 0;
                    finalEmission = CalculateEmission(usage, oldEmission);
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

            return finalEmission;
        }

        public void AddUsage(string product, int quantity)
        {
            try
            {
                decimal finalEmission = 0;
                var username = Context.User.Identity.GetUserId();
                var ctx = ApplicationDbContext.Create();
                var usage =
                    ctx.UserUsages.FirstOrDefault(
                        u =>
                            u.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase) &&
                            u.Product.Equals(product, StringComparison.InvariantCultureIgnoreCase));

                if (usage == null)
                {
                    usage = new UserUsage
                    {
                        Username = username,
                        Emission = 0,
                        Product = product,
                        Quantity = quantity
                    };

                    finalEmission = CalculateEmission(usage, 0);

                    ctx.UserUsages.Add(usage);
                }
                else
                {
                    if (quantity <= 0)
                    {
                        finalEmission = RemoveUsage(usage.Id);
                    }
                    else
                    {
                        var oldEmission = usage.Emission;
                        usage.Quantity = quantity;
                        finalEmission = CalculateEmission(usage, oldEmission);
                    }
                }

                var appUser =
                    ctx.Users
                        .FirstOrDefault(u => u.Id.ToString().Equals(username, StringComparison.InvariantCultureIgnoreCase));

                if (appUser != null)
                {
                    appUser.Emission = finalEmission;
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

        private decimal CalculateEmission(UserUsage usage, decimal oldEmission)
        {
            decimal finalEmission = 0;
            try
            {
                var rand = new Random();
                var factor = 0.0;
                var averageUsage = 0.0;

                switch (usage.Product.Trim().ToUpper())
                {
                    case "BEDROOMS":
                        factor = 0.27;
                        averageUsage = 4;
                        break;
                    case "COMPUTER":
                        factor = 0.19;
                        averageUsage = 4;
                        break;
                    case "MOBILE PHONES":
                        factor = 0.02;
                        averageUsage = 4;
                        break;
                    case "TELEVISION":
                        factor = 0.58;
                        averageUsage = 8;
                        break;
                    case "MICROWAVE OVEN":
                        factor = 0.945;
                        averageUsage = 1;
                        break;
                    case "OVEN":
                        factor = 1.56;
                        averageUsage = 1;
                        break;
                    case "AIRCONDITIONER":
                        factor = 1.25;
                        averageUsage = 2.5;
                        break;
                    case "HEATER":
                        factor = 1.11;
                        averageUsage = 2.5;
                        break;
                    case "REFRIGERATOR":
                        factor = 0.42;
                        averageUsage = 24;
                        break;
                    case "FREEZER":
                        factor = 0.56;
                        averageUsage = 24;
                        break;
                    case "DISHWASHER":
                        factor = 1.07;
                        averageUsage = 1.5;
                        break;
                    case "DRYER":
                        factor = 2.50;
                        averageUsage = 1;
                        break;
                    case "WASHING MACHINE":
                        factor = 0.63;
                        averageUsage = 1;
                        break;
                    case "LIGHT BULB":
                        factor = 0.08;
                        averageUsage = 12;
                        break;
                }

                usage.Emission = (decimal) (usage.Quantity*factor*averageUsage*365);

                // update user emission
                var username = Context.User.Identity.GetUserId();
                var user = _connections.Get(username);
                if (user != null)
                {
                    user.Emission -= oldEmission;
                    user.Emission += usage.Emission;
                    finalEmission = user.Emission;
                    _connections.Update(user);
                }
            }
            catch
            {
            }

            return finalEmission;
        }
    }
}