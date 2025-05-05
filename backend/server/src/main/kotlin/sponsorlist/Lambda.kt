package sponsorlist

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.google.gson.Gson
import sponsorlist.appstuff.IDBHandler
import sponsorlist.appstuff.Personality
import sponsorlist.appstuff.Platform
import sponsorlist.appstuff.S3Handler
import sponsorlist.appstuff.SponsorItem


val handler: IDBHandler = S3Handler()
val gson: Gson = Gson()

class SponsorItemHandler() : RequestHandler<SponsorItem, String> {
    override fun handleRequest(
        p0: SponsorItem?,
        p1: Context?
    ): String? {
        p1?.logger?.log("SponsorItemHandler called :: ${p1.awsRequestId}")
        if (p0 == null) {
            p1?.logger?.log("SponsorItemHandler :: Get List")
            return gson.toJson(handler.getSponsorList())
        } else {
            p1?.logger?.log("SponsorItemHandler :: Add ${p0}")
            handler.addSponsorItem(p0)
            return "Success"
        }
    }

}

class PlatformHandler() : RequestHandler<Platform?, String> {
    override fun handleRequest(
        p0: Platform?,
        p1: Context?
    ): String? {
        p1?.logger?.log("PlatformHandler called :: ${p1.awsRequestId}")
        if (p0 == null) {
            p1?.logger?.log("PlatformHandler :: Get List")
            return gson.toJson(handler.getPlatformList())
        } else {
            p1?.logger?.log("PlatformHandler :: Add ${p0}")
            handler.addPlatform(p0)
            return "Success"
        }
    }

}

class PersonalityHandler() : RequestHandler<Personality?, String> {
    override fun handleRequest(
        p0: Personality?,
        p1: Context?
    ): String? {
        p1?.logger?.log("PersonalityHandler called :: ${p1.awsRequestId}")
        if (p0 == null) {
            p1?.logger?.log("PersonalityHandler :: Get List")
            return gson.toJson(handler.getPersonalityList())
        } else {
            p1?.logger?.log("PersonalityHandler :: Add ${p0}")
            handler.addPersonality(p0)
            return "Success"
        }
    }
}

//public class FileStructureHandler() : RequestHandler<FileStructure?, String> {
//    override fun handleRequest(
//        p0: FileStructure?,
//        p1: Context?
//    ): String? {
//        p1?.logger?.log("FileHandler called :: ${p1.awsRequestId}")
//        if (p0 == null) {
//            p1?.logger?.log("FileHandler :: Get List")
//            return gson.toJson(handler.sponsorsList)
//        } else {
//            p1?.logger?.log("FileHandler :: Add ${p0}")
//            p0.sponsorItems.forEach { handler.addToList("sponsorsList", it) }
//            p0.personalities.forEach { handler.addToList("personality", it) }
//            p0.platforms.forEach { handler.addToList("platform", it) }
//            return "Success"
//        }
//    }
//}