using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TimeTraveller.Models;

namespace TimeTraveller
{
    public class ConnectionMapping
    {
        private readonly List<User> _connections = new List<User>();

        public int Count
        {
            get
            {
                return _connections.Count;
            }
        }

        public bool IsExist(string username)
        {
            lock (_connections)
            {
                return _connections.Any(c => c.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase));
            }
        }

        public void Add(User user)
        {
            lock (_connections)
            {
                if (!_connections.Any(c => c.Username.Equals(user.Username, StringComparison.InvariantCultureIgnoreCase)))
                {
                    lock (_connections)
                    {
                        _connections.Add(user);
                    }
                }
            }
        }

        public User Get(string username)
        {
            return
                _connections.FirstOrDefault(
                    c => c.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase));
        }

        public void Update(User user)
        {
            foreach (var c in _connections)
            {
                if (c.Username.Equals(user.Username, StringComparison.InvariantCultureIgnoreCase))
                {
                    c.Latitude = user.Latitude;
                    c.Longitude = user.Longitude;
                }
            }
        }

        public List<User> GetConnections()
        {
            return _connections;
        }

        public void Remove(string username)
        {
            lock (_connections)
            {
                if (_connections.Any(c => c.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase)))
                {
                    var user =
                        _connections.FirstOrDefault(
                            c => c.Username.Equals(username, StringComparison.InvariantCultureIgnoreCase));

                    _connections.Remove(user);

                }
            }          
        }
    }
}