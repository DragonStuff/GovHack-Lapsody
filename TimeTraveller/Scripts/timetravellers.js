

function logOff() {
    var hyperHub = new HyperHub(null);
    hyperHub.disconnect();
    window.location = "/Account/Logoff";
}