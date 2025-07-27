class Authenticator {
    constructor() {
        this.user = null;
        this.domain = "sponsorlist.org";
        this.authDomain = "https://auth.sponsorlist.org";
        this.webDomain = "https://www.sponsorlist.org";
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
        this.cognitoAuthority = "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_qgJUb4SOQ";
        this.cognitoDomain = "https://us-east-2qgjub4soq.auth.us-east-2.amazoncognito.com";
        this.clientId = "3rmliqfj8asqdjit5siitb4jrr";
        this.cognitoAuthConfig = {
            authority: this.cognitoAuthority,
            client_id: this.clientId,
            redirect_uri: this.webDomain,
            response_type: "code",
            scope: "email openid phone",
        };
        this.userManager = new Oidc.UserManager({
            ...this.cognitoAuthConfig,
        });
    }

    async isAuthenticated() {
        return this.userManager.getUser().then(user => {    
            return user !== null;
        }).catch(error => {
            console.error("Error checking authentication:", error);
            return false;
        });
    }

    async signIn() {
        try {
            await this.userManager.signinRedirect();

            if (document.referrer.includes("auth.sponsorlist.org") || document.referrer.includes("cognito")) {
                auth.userManager.signinCallback().then(function (user) {
                    this.user=user;
                    console.log("Sign-in successful:", user);
                });
            }
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
        window.location.href = `${this.cognitoDomain}/login?client_id=${this.clientId}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(this.webDomain)}`;
    };

    async signOutRedirect () {
        window.location.href = `${this.cognitoDomain}/logout?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.webDomain)}`;
    };
}