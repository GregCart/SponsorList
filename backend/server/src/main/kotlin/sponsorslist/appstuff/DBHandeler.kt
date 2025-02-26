package sponsorslist.appstuff

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.File
import java.io.FileWriter

class DBHandeler {
    companion object {
        const val path = "src/main/resources/data/sponsorsList.json";
    }


    val gson = Gson()
    val sponsorsList: MutableList<SponsorLinkItem> = mutableListOf<SponsorLinkItem>()


    public constructor() {
        readFromFile();
    }

    fun readFromFile() {
        var f: File = File(path);

        if (f == null || !f.exists()) {
            println("hahahaha")
            if (f.mkdirs()) {
                FileWriter(path).use { writer ->
                    gson.toJson(sponsorsList, writer)
                }
            } else {
                var dir = File("src/main/resources/data")

                throw Error("dir failed? " + dir.mkdirs())
            }
        }
        gson.fromJson(f.readText(), sponsorsList::class.java)

//        for (str: String in f.readLines()) {
//            sponsorsList.add(gson.fromJson(str, SponsorLinkItem::class.java))
//        }
    }

    fun writeToFile() {
        FileWriter(path).use { writer ->
            gson.toJson(sponsorsList, writer)
        }
    }

    fun getList(): MutableList<SponsorLinkItem> {
        return sponsorsList;
    }

    fun addToList(item: SponsorLinkItem) {
        this.sponsorsList.add(item)
        writeToFile()
    }
}