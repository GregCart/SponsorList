package sponsorlist.appstuff

import java.util.*


data class SponsorItem(
    var personality:String="", var sponsor:String="", var platform:String="", var code:String="", var post:String="",
    var start: Date = Date(), var added:Date = Date(), var lastChecked:Date? = null, var verified:Date? = null,
    var valid:Boolean=false, var scam:Boolean=false
)

data class SponsorItemList(var list: List<SponsorItem>)

data class Platform(
    var name: String = "",
    var url: String? = null,
    var logoUrl: String = "",
    var description: String = ""
)

data class PlatformList(var list: List<SponsorItem>)

data class Personality(
    var name: String = "",
    var platforms: Map<Platform, String> = emptyMap(),
    var description: String? = null
)

data class PersonalityList(var list: List<Personality>)

//data class FileStructure(
//    var sponsorItems: List<SponsorItem> = emptyList<SponsorItem>(),
//    var platforms: List<Platform> = emptyList<Platform>(),
//    val personalities: List<Personality> = emptyList<Personality>()
//)