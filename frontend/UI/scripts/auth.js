class Authenticator {
    constructor() {
        this.user = null;
        this.domain = "https://www.sponmsorlist.org";
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
            authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_dpwlMzpdR",
            client_id: this.clientId,
            redirect_uri: "https://sponsorlist.org",
            response_type: "code",
            scope: "phone openid email"
        };
        this.userManager = new UserManager({
            ...cognitoAuthConfig,
        });
    }

    async signIn() {
        try {
            this.user = await this.signinCallback();
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

    async signinCallback() {
        const logedinuri = this.domain + "/home.html";
        window.location.href = `${this.cognitoDomain}/login/continue?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(logedinuri)}&response_type=code&scope=email+openid+phone`;
    }

    async signOutRedirect () {
        const logoutUri = this.domain + "/index.html";
        window.location.href = `${this.cognitoDomain}/logout?client_id=${this.clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };
}