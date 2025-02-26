package sponsorslist.appstuff

import io.ktor.http.*
import java.sql.Date


data class SponsorLinkItem(val personalityName:String, val sponsorName:String,
                           val debutdPlatform:String,
                           var link:Url?, var code:Url?,
                           val dateAdded:Date, var lastChecked:Date, var lastVerified:Date,
                           val valid:Boolean);
