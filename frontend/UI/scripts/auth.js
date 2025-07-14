class Authenticator {
    constructor() {
        this.user = null;
        this.domain = "sponsorlist.org";
    }

    isAuthenticated() {
        return this.user !== null;
    }

    async signIn() {};

    async signOut() {};
}

class CognitoAuthenticator extends Authenticator {
    constructor() {
        super();
        this.cognitoDomain = "https://us-east-2xuuostp7n.auth.us-east-2.amazoncognito.com";
        this.clientId = "1kbhhpu2busr0v2al4otgitvdc";
        this.cognitoAuthConfig = {
            authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_XUUoStp7N",
            client_id: "1kbhhpu2busr0v2al4otgitvdc",
            redirect_uri: "https://www.sponsorlist.org/",
            response_type: "code",
            scope: "email openid phone",
        };
        this.userManager = new Oidc.UserManager({
            ...this.cognitoAuthConfig,
        });
    }

    async signIn() {
        try {
            // this.user = await this.signinCallback();
            this.userManager.signinRedirect().then((user) => {
                this.user = user;
                console.log("Sign-in successful:", user);
            });
        } catch (error) {
            console.error("Sign-in failed:", error);
        }
    }

    async signOut() {
        try {
            await this.signoutRedirect();
            this.user = null;
        } catch (error) {
            console.error("Sign-out failed:", error);
        }
    }

    async signInRedirect () {
        window.location.href = `https://auth.${this.domain}/login?client_id=${this.clientId}&login_uri=${encodeURIComponent("https://www." + this.domain)}&response_type=code&scope=email+openid+phone`;
    };

    async signOutRedirect () {
        window.location.href = `https://auth.${this.domain}/logout?client_id=${this.clientId}&logout_uri=${encodeURIComponent("https://www." + this.domain)}`;
    };
}