package sponsorlist.appstuff

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.google.gson.stream.JsonReader
import java.io.FileWriter

class DBHandeler {
    companion object {
        const val path = "/data/sponsorsList.json";
    }


    val gson = Gson()
    val sponsorsList: MutableList<SponsorLinkItem> = mutableListOf<SponsorLinkItem>()
    val personalities: MutableSet<Personality> = mutableSetOf<Personality>()
    val platforms: MutableSet<Platform> = mutableSetOf<Platform>()


    public constructor() {
        readFromFile();
    }

    fun readFromFile() {
//        val fileReader = FileReader(path)
        val fileStream = object {}.javaClass.getResourceAsStream(path)?.bufferedReader()
        val jsonReader = JsonReader(fileStream)

        try {
            var type = object : TypeToken<Map<String, List<Any>>>() {}.type
            val jsonMap: Map<String, List<Any>> = gson.fromJson(jsonReader, type);
            sponsorsList.addAll(jsonMap["sponsorsListItem"] as MutableList<SponsorLinkItem>);
            personalities.addAll((jsonMap["personalities"] as MutableList<Personality>));
            platforms.addAll(jsonMap["platforms"] as MutableList<Platform>);
        } finally {
            jsonReader.close()
            jsonReader.close()
        }

    }

    fun writeToFile() {
        val writer = FileWriter(path)
        val dataMap = mapOf(
            "sponsorsListItem" to sponsorsList,
            "platforms" to platforms,
            "personalities" to personalities
        )

        gson.toJson(dataMap, writer)

        writer.close()
    }

    fun sponsorsListItemBySponsorName(key: String): List<SponsorLinkItem> {
        return sponsorsList.filter { it.sponsorName == key};
    }

    fun personalityBySponsorName(key: String): List<Personality> {
        return personalities.filter { it.name == key};
    }

    fun addToList(listName: String, item: Any) {
        when (listName) {
            "sponsorsLink", "sponsorsList" -> addSponsorLink(item as SponsorLinkItem)
            "personality" -> addPersonality(item as Personality)
            "platform" -> addPlatform(item as Platform)
        }
    }

    fun addSponsorLink(item: SponsorLinkItem) {
        this.sponsorsList.add(item)
        writeToFile()
    }

    fun addPersonality(person: Personality) {
        this.personalities.add(person)
        writeToFile();
    }

    fun addPlatform(platform: Platform) {
        this.platforms.add(platform)
        writeToFile()
    }
}