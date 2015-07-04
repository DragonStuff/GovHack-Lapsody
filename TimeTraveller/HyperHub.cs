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
                var user = new User
                {
                    Username = username,
                    Fullname = "",
                    Latitude = 0,
                    Longitude = 0
                };

                _connections.Add(user);
            }

            var ctx = ApplicationDbContext.Create();
            var usage = ctx.UserUsages.ToList();

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string username = Context.User.Identity.GetUserId();

            _connections.Remove(username);

            Clients.All.userListChanged(JsonConvert.SerializeObject(_connections.GetConnections()));

            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            string username = Context.User.Identity.GetUserId();

            if (!_connections.IsExist(username))
            {
                var user = new User
                {
                    Username = username,
                    Fullname = "",
                    Latitude = 0,
                    Longitude = 0
                };

                _connections.Add(user);
            }

            return base.OnReconnected();
        }

        public void UpdateLocation(decimal latitude, decimal longitude)
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

            Clients.All.userListChanged(JsonConvert.SerializeObject(_connections.GetConnections()));
        }

        public void Disconnect()
        {
            string username = Context.User.Identity.GetUserId();

            _connections.Remove(username);

            Clients.All.userListChanged(JsonConvert.SerializeObject(_connections.GetConnections()));
        }


        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.broadcastMessage(name, message);
        }
    }
}