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
        }
    }
}
