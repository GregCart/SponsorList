package sponsorlist.plugins

import io.ktor.server.application.*
//import io.ktor.server.plugins.cors.routing.*
//import io.ktor.server.plugins.swagger.*
import io.ktor.server.routing.*

fun Application.configureHTTP() {
    routing {
//        swaggerUI(path = "openapi")
    }
//    install(CORS) {
//        allowMethod(HttpMethod.Options)
////        allowMethod(HttpMethod.Put)
////        allowMethod(HttpMethod.Delete)
//        allowMethod(HttpMethod.Post)
//        allowMethod(HttpMethod.Get)
//        allowHeader(HttpHeaders.Authorization)
//        allowHeader("MyCustomHeader")
//        anyHost() // @TODO: Don't do this in production if possible. Try to limit it.
//    }
}
