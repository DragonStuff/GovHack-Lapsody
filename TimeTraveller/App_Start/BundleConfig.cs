using System.Web;
using System.Web.Optimization;

namespace TimeTraveller
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/materialadmin/libs/jquery-ui/jquery-ui.min.js",
                        "~/Scripts/jquery.signalR-{version}.js",
                        "~/Scripts/jquery.cookie.js",
                        "~/Scripts/hyperhub.js"
                        ));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js",
                      "~/Scripts/materialadmin/core/source/*.js",
                      "~/Scripts/materialadmin/libs/gmaps/*.js",
                      "~/Scripts/materialadmin/libs/toastr/*.js",
                      "~/Scripts/materialadmin/libs/bootstrap-datepicker/*.js",
                      "~/Scripts/markerclusterer.js",
                      "~/Scripts/timetravellers.js"
                      ));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/materialadmin/css/theme-1/materialadmin.css",
                      "~/Content/materialadmin/css/theme-1/font-awesome.css",
                      "~/Content/materialadmin/css/theme-1/material-design-iconic-font.css",
                      "~/Content/materialadmin/css/theme-default/libs/toastr/*.css",
                      "~/Content/materialadmin/css/theme-default/libs/bootstrap-datepicker/*.css",
                      "~/Content/site.css"));

            System.Web.Optimization.BundleTable.EnableOptimizations = false;
        }
    }
}
