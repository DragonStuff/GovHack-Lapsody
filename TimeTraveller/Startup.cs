using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(TimeTraveller.Startup))]
namespace TimeTraveller
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);

            string connectionString = "Endpoint=sb://timetraveller.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=F60F8xF2IbfbGW6ztc0sKb6QJAUO1XEtByLbUDmNOAE=";
            GlobalHost.DependencyResolver.UseServiceBus(connectionString, "TimeTravellers");

            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}
