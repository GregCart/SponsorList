package sponsorlist.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import sponsorlist.appstuff.S3Handler
import sponsorlist.appstuff.SponsorItem
import java.io.File


val handler = S3Handler();

fun Application.configureRouting() {
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
        }
    }
    install(AutoHeadResponse)
//    routing {
//        get("/") {
//            call.respondText("Hello World!")
//        }
//        get("/getItemList") {
//            call.respond(handler.sponsorsList);
//        }
//        post("/addToList/{type}") {
//            val type = call.pathParameters["type"]
//            call.respond(type?.let { handler.addToList(it, call.receive<SponsorItem>()) }!!)
//        }
//        get("/{personality}") {
//            var personalityName = call.pathParameters["personality"];
//            call.respond(personalityName?.let { handler.personalityBySponsorName(it) }!!)
//        }
//        get("/download") {
//            call.respond(handler.getFile());
//        }
//        post("/upload") {
//            val file = call.receive<File>()
//            call.respond(handler.addFromFile(file))
//        }
//    }
}
