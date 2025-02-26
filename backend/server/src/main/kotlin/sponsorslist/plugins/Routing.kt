package tabletoprug.sponsorslist.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import sponsorslist.appstuff.DBHandeler
import sponsorslist.appstuff.SponsorLinkItem


val handler = DBHandeler();

fun Application.configureRouting() {
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
        }
    }
    install(AutoHeadResponse)
    routing {
        get("/") {
            call.respondText("Hello World!")
        }
        get("/getAll") {
            call.respond(handler.getList());
        }
        post("/addToList") {
            call.respond(handler.addToList(call.receive<SponsorLinkItem>()))
        }
        get("/{personality}") {

        }
    }
}
