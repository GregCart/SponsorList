package sponsorlist.appstuff

import io.ktor.http.*
import java.util.Date


data class SponsorItem(
    val personality:String="", val sponsor:String="", val platform:String="", var code:String="", var post:String="",
    val start: Date = Date(), val added:Date = Date(), var lastChecked:Date? = null, var verified:Date? = null,
    var valid:Boolean=false, var scam:Boolean=false
);

data class Platform(
    val name: String = "",
    val url: String? = null,
    val logoUrl: String = "",
    val description: String = ""
)

data class Personality(
    val name: String = "",
    val platforms: Map<Platform, String> = emptyMap(),
    val description: String? = null
)

data class FileStructure(
    val sponsorItems: List<SponsorItem> = emptyList<SponsorItem>(),
    val platforms: List<Platform> = emptyList<Platform>(),
    val personalities: List<Personality> = emptyList<Personality>()
)