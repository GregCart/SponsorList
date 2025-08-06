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
        this.idPoolId = "us-east-2:fadf8d53-931f-459e-906b-d56f3890a66a";
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
        return await this.userManager.getUser().then(user => {
            if(user == null || user.expired) {
                return false
            }

            return new Date(user.expires_at * 1000) > new Date();
        }).catch(error => {
            console.error("Error checking authentication:", error);
            return false;
        });
    }

    async signIn() {
        try {
            await this.userManager.signinRedirect();
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

    async signInCallback(code, state) {
        await this.userManager.signinCallback().then(function (user) {
            this.user = user;
            this.userManager.storeUser(user);
            console.log("Sign-in successful:", user);
            let creds = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.idPoolId,
            });
            
            creds.params.Logins = creds.params.Logins || {};
            creds.params.Logins["www.amazon.com"] = user.id_token;
            
            // Expire credentials to refresh them on the next request
            creds.expired = true;

            AWS.config.credentials = creds;
            console.log("Cognito credentials set:", creds);
        });
    }
}