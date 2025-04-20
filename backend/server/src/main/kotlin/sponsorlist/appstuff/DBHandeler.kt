package sponsorlist.appstuff

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.google.gson.stream.JsonReader
import java.io.File
import java.io.FileReader
import java.io.FileWriter

class DBHandeler {
    companion object {
        const val path = "./data/sponsorsList.json";
    }


    val gson = Gson()
    val sponsorsList: MutableList<SponsorItem> = mutableListOf<SponsorItem>()
    val personalities: MutableSet<Personality> = mutableSetOf<Personality>()
    val platforms: MutableSet<Platform> = mutableSetOf<Platform>()


    public constructor() {
        readFromFile();
    }

    fun readFromFile() {
        val fileReader = FileReader(path)
        val fileStream = if (fileReader != null) fileReader.buffered() else object {}.javaClass.getResourceAsStream(path)?.bufferedReader()
        val jsonReader = JsonReader(fileStream)

        try {
            var type = object : TypeToken<Map<String, List<Any>>>() {}.type
            val jsonMap: Map<String, List<Any>> = gson.fromJson(jsonReader, type);
            sponsorsList.addAll(jsonMap["sponsorsListItem"] as MutableList<SponsorItem>);
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

    fun sponsorsListItemBySponsorName(key: String): List<SponsorItem> {
        return sponsorsList.filter { it.sponsor == key};
    }

    fun personalityBySponsorName(key: String): List<Personality> {
        return personalities.filter { it.name == key};
    }

    fun addToList(listName: String, item: Any) {
        when (listName) {
            "sponsorsLink", "sponsorsList" -> addSponsorLink(item as SponsorItem)
            "personality" -> addPersonality(item as Personality)
            "platform" -> addPlatform(item as Platform)
        }
    }

    fun addSponsorLink(item: SponsorItem) {
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

    fun getFile(): File {
        return File(path);
    }

    fun addFromFile(file: File) {
        val data = gson.fromJson(file.readText(), FileStructure::class.java)
        if (!data.personalities.isNullOrEmpty()) {
            for (p: Personality in data.personalities) {
                this.addPersonality(p);
            }
        }
        if (!data.sponsorItems.isNullOrEmpty()) {
            for (s: SponsorItem in data.sponsorItems) {
                this.addSponsorLink(s);
            }
        }
        if (!data.platforms.isNullOrEmpty()) {
            for (p: Platform in data.platforms) {
                this.addPlatform(p);
            }
        }

        writeToFile()
    }
}