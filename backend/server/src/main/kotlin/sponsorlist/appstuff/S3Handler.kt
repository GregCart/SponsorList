package sponsorlist.appstuff

import com.google.gson.Gson
import io.ktor.http.ContentType
import io.ktor.utils.io.core.Closeable
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.awscore.presigner.PresignedRequest
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.http.apache.ApacheHttpClient
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.ListObjectsRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.model.S3Object
import sponsorlist.appstuff.IDBHandler.Companion.DATA_PATH
import sponsorlist.appstuff.IDBHandler.Companion.PERSONALITIES
import sponsorlist.appstuff.IDBHandler.Companion.SPONSOR_ITEMS
import java.io.File
import java.net.http.HttpClient
import java.text.SimpleDateFormat
import java.util.Date


class S3Handler: Closeable, IDBHandler {
    companion object {
        val BUCKET_NAME = "sponsorlist-test";
        val BASE_PATH = "$DATA_PATH/entries"

        public fun s3Client(): S3Client {
            return S3Client.builder()
                .httpClientBuilder(ApacheHttpClient.builder())
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
        }
    }

    private val s3Client: S3Client = s3Client();
    private val gson: Gson = Gson();


    public fun writeToFile(fileName: String, data: String): Unit {
        TODO("Implement update fiel")
//        var writeReq: PutObjectRequest = PutObjectRequest.builder()
//                .key(fileName)
//                .bucket(BUCKET_NAME)
//                .contentType(ContentType.Application.Json.toString())
//                .build()
//        var reqBody = RequestBody.fromString(data)
    }

    public fun getFile(fileName: String = "", personality: String ="", sponsor: String = "", status: String = "active"): List<String> {
        var listReq: ListObjectsRequest
        var date = SimpleDateFormat("YYYY-MM-DD").format(Date())

        when (fileName) {
            PERSONALITIES -> listReq = ListObjectsRequest.builder()
                                    .prefix("$DATA_PATH/$fileName.json")
                                    .bucket(BUCKET_NAME).build();
            else -> listReq = ListObjectsRequest.builder()
                                    .prefix("$BASE_PATH/$date/")
                                    .bucket(BUCKET_NAME).build();
        }

        val resp = s3Client.listObjects(listReq)

        val response = resp.contents().map { it ->
            String(s3Client.getObject(
                GetObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(it.key())
                    .build()
            ).readAllBytes())
        }

        return response;
    }

    override fun close() {
        s3Client.close();
    }

    override fun getSponsorList(): List<SponsorItem> {
        return gson.fromJson(String(getFile()), List::class.java) as List<SponsorItem>;
    }

    override fun addSponsorItem() {
        TODO("Not yet implemented")
    }

    override fun removeSponsorItem(): SponsorItem {
        TODO("Not yet implemented")
    }

    override fun getPersonalityList(): List<Personality> {
        return gson.fromJson(String(getFile(IDBHandler.PERSONALITIES)), List::class.java) as List<Personality>;
    }

    override fun addPersonality() {
        TODO("Not yet implemented")
    }

    override fun removePersonality(): Personality {
        TODO("Not yet implemented")
    }

    override fun getPlatformList(): List<Platform> {
        return gson.fromJson(String(getFile(IDBHandler.PLATFORMS)), List::class.java) as List<Platform>;
    }

    override fun addPlatform() {
        TODO("Not yet implemented")
    }

    override fun removePlatform(): Platform {
        TODO("Not yet implemented")
    }

    override fun addFromFile(file: File) {
        TODO("Not yet implemented")
    }
}