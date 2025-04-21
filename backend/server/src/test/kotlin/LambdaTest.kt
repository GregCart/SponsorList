package tabletoprug

import com.amazonaws.services.lambda.runtime.Context
import io.ktor.http.Url
import io.mockk.mockk
import org.hamcrest.MatcherAssert.assertThat
import org.junit.Test
import sponsorlist.FileStructureHandler
import sponsorlist.PersonalityHandler
import sponsorlist.PlatformHandler
import sponsorlist.SponsorItemHandler
import sponsorlist.appstuff.FileStructure
import sponsorlist.appstuff.Personality
import sponsorlist.appstuff.Platform
import sponsorlist.appstuff.SponsorItem
import java.util.Date


class LambdaTest {
    val context = mockk<Context>(relaxed = true)
    val sponsorItem = SponsorItem("test","test","test","test",
        "http://test.com",Date(),Date(),
        null, null, false, false)
    val personality = Personality("test")
    val platform = Platform(name = "testPl", logoUrl = "http://test.com", description = "test desc")
    val fileStruct = FileStructure(emptyList(), emptyList(), emptyList())

    @Test
    fun sponsorItemTest() {
        val handler = SponsorItemHandler()

        assert(handler.handleRequest(sponsorItem, context) == "Success")
    }

    @Test
    fun personalityTest() {
        val handler = PersonalityHandler()

        assert(handler.handleRequest(personality, context) == "Success")
    }

    @Test
    fun platformTest() {
        val handler = PlatformHandler()

        assert(handler.handleRequest(platform, context) == "Success")
    }

    @Test
    fun fileStructureTest() {
        val handler = FileStructureHandler()

        assert(handler.handleRequest(fileStruct, context) == "Success")
    }
}