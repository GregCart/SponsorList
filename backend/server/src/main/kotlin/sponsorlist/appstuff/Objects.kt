package sponsorlist.appstuff

import io.ktor.http.*
import java.sql.Date


data class SponsorItem(
    val personality:String, val sponsor:String, val platform:String, var code:String, var post:Url,
    val start: Date, val added:Date, var lastChecked:Date?, var verified:Date?,
    var valid:Boolean, var scam:Boolean
);

data class Platform(
    val name: String,
    val url: String?,
    val logoUrl: String,
    val description: String
)

data class Personality(
    val name: String,
    val platforms: Map<Platform, String> = emptyMap(),
    val description: String? = null
)

data class FileStructure(
    val sponsorItems: List<SponsorItem>,
    val platforms: List<Platform>,
    val personalities: List<Personality>
)