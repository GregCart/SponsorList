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
        this.cognitoAuthority = "cognito-idp.us-east-2.amazonaws.com/us-east-2_qgJUb4SOQ";
        this.cognitoDomain = "us-east-2qgjub4soq.auth.us-east-2.amazoncognito.com";
        this.clientId = "3rmliqfj8asqdjit5siitb4jrr";
        this.idPoolId = "us-east-2:fadf8d53-931f-459e-906b-d56f3890a66a";
        this.creds = {};
        this.cognitoAuthConfig = {
            authority: "https://" + this.cognitoAuthority,
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
            await this.userManager.signoutRedirect();
            this.user = null;
        } catch (error) {
            console.error("Sign-out failed:", error);
        }
    }

    async signInRedirect () {
        window.location.href = `https://${this.cognitoDomain}/login?client_id=${this.clientId}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(this.webDomain)}`;
    };

    async signOutRedirect () {
        let location = `https://${this.cognitoDomain}/logout?client_id=${this.clientId}&logout_uri=${encodeURIComponent(this.webDomain)}`
        window.location.href = `https://${this.cognitoDomain}/logout?client_id=${this.clientId}&logout_uri=${encodeURIComponent(this.webDomain)}`;
    };

    async signInCallback(code, state, onLoginSuccess) {
        await this.userManager.signinCallback().then(function (user) {
            // user.state = state;0
            auth.user = user;
            auth.userManager.storeUser(user);
            console.log("Sign-in successful:", user);
            let creds = AWS.config.credentials || new AWS.CognitoIdentityCredentials({
                IdentityPoolId: auth.idPoolId,
                Logins: {}
            }, {
                region: "us-east-2"
            });
            
            creds.params.Logins = creds.params.Logins || {};
            // creds.params.Logins["www.amazon.com"] = user.id_token;
            // creds.params.Logins[auth.cognitoAuthority] = code;
            // creds.params.Logins["www.amazon.com"] = user.access_token;
            // creds.params.Logins[auth.cognitoAuthority] = user.getIdToken().getJwtToken();   //according to the doocumentation, this should work (doesnt work)
            creds.params.Logins[auth.cognitoAuthority] = user.id_token;   //according to cognito documentation, this should work
            
            // Expire credentials to refresh them on the next request
            creds.expired = true;

            AWS.config.credentials = creds;
            console.log("Global credentials set:", creds);
            
            AWS.config.credentials.get(function(){

                // Credentials will be available when this function is called.
                var accessKeyId = AWS.config.credentials.accessKeyId;
                var secretAccessKey = AWS.config.credentials.secretAccessKey;
                var sessionToken = AWS.config.credentials.sessionToken;
            });
        }).catch(function (err) {
            console.error("Sign-in callback failed:", err)
            if (err.message.includes("state")) {
                auth.user = null;
                auth.userManager.removeUser();
                console.error("State mismatch, user not authenticated.");
                window.location.href = auth.webDomain;
            }
        });
    }
}