using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using TimeTraveller.Models;

namespace TimeTraveller.Controllers
{
    public class CommonController : Controller
    {
        public static string Fullname
        {
            get { return System.Web.HttpContext.Current.Session["BusinessID"].ToString(); }
            set { System.Web.HttpContext.Current.Session["BusinessID"] = value; }
        }

        // GET: Common
        public ActionResult UserDetails()
        {
            if (Session["Fullname"] == null)
            {
                var currentUserId = User.Identity.GetUserId();
                var manager =
                    new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext()));
                var currentUser = manager.FindById(currentUserId);
                Session["Fullname"] = currentUser.FullName;
            }

            return PartialView("_UserDetails");
        }        
        
        // GET: Common
        public ActionResult MyUsage()
        {
            return PartialView("_MyUsage");
        }
    }
}