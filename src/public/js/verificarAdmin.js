export let verificarAdmin = (req) => {
    let activateSession;
    let admin;
    if (req.session?.user) {
      activateSession = true;
    } else {
      activateSession = false;
    }
    if (req.session?.user.rol == "admin") {
      admin = true;
    } else {
      admin = false;
    }
    return {activateSession, admin};
};