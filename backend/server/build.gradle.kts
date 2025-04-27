import org.gradle.kotlin.dsl.register

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
}

val handlers = listOf("SponsorItemHandler", "PlatformHandler", "PersonalityHandler", "FileStructureHandler")

group = "tabletoprug"
version = "0.5.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.serialization.gson)
//    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.call.logging)
//    implementation(libs.ktor.server.swagger)
//    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.host.common)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.server.auto.head.response)
//    implementation(libs.ktor.server.csrf)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    implementation(libs.ktor.server.config.yaml)
    testImplementation(libs.ktor.server.test.host)
    implementation("com.amazonaws:aws-lambda-java-core:1.2.3")
    implementation ("com.amazonaws:aws-lambda-java-events:3.11.1")
    implementation(platform("software.amazon.awssdk:bom:2.27.21"))
    implementation("software.amazon.awssdk:sso")
    implementation("software.amazon.awssdk:s3")
    implementation("software.amazon.awssdk:apache-client")
    implementation("software.amazon.awssdk:ssooidc")

    testImplementation(libs.kotlin.test.junit)
    testImplementation("io.mockk:mockk:1.14.0")
}

ktor {
    docker {
        jreVersion.set(JavaVersion.VERSION_21)
        localImageName.set("tabletoprug/sponsorlist-server")
        imageTag.set("0.1.0")
        portMappings.set(listOf(
            io.ktor.plugin.features.DockerPortMapping(
                9000,
                9000,
                io.ktor.plugin.features.DockerPortMappingProtocol.TCP
            )
        ))
        externalRegistry.set(
            io.ktor.plugin.features.DockerImageRegistry.dockerHub(
                appName = provider { "ktor-app" },
                username = providers.environmentVariable("DOCKER_HUB_USERNAME"),
                password = providers.environmentVariable("DOCKER_HUB_PASSWORD")
            )
        )
    }
}

tasks.wrapper {
    gradleVersion = "8.13"
    distributionType = Wrapper.DistributionType.ALL
}

//tasks.jar {
//    manifest {
//        attributes.set("Main-Class", "io.ktor.server.netty.EngineMain")
//    }
//
//    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
//    from(configurations.runtimeClasspath.get().map(::zipTree))
////    dependsOn(handlers)
//}

//handlers.forEach {
//    tasks.register<Jar>(it) {
//        include("*")
//        manifest {
//            attributes.set("Main-Class", "sponsorlist.$it")
//        }
//        archiveBaseName = it
//        duplicatesStrategy = DuplicatesStrategy.EXCLUDE
//        from(configurations.runtimeClasspath.get().map(::zipTree))
////        with(tasks.jar as CopySpec?)
//    }
//}