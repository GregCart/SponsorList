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
        return await this.userManager.getCurrentUser().then(user => {
            auth.user = user;    
            user.getSession(function(err, result) {
                if (result) {
                    console.log('You are now logged in.');
                    let login = 'cognito-idp.us-east-2.amazonaws.com/' + this.idPoolId;
                    let creds = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: this.idPoolId,
                        Logins: {
                            [login]: result.getIdToken().getJwtToken()
                        }
                    });
                    // creds.params.Logins.put(login, result.getIdToken().getJwtToken());
                    // Add the User's Id Token to the Cognito credentials login map.
                    AWS.config.credentials = creds;
                    return true;
                }
            });
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
}