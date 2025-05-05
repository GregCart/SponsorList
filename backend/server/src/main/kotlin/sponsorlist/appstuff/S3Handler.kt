package sponsorlist.appstuff

import com.google.gson.Gson
import io.ktor.utils.io.core.Closeable
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.http.apache.ApacheHttpClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.ListObjectsRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import sponsorlist.appstuff.IDBHandler.Companion.DATA_PATH
import sponsorlist.utils.like
import sponsorlist.utils.subtractDays
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date


class S3Handler: Closeable, IDBHandler {
    companion object {
        val BUCKET_ENV_NAME = "bucket_name";
        val BUCKET_NAME = System.getenv(BUCKET_ENV_NAME)
        val BASE_PATH = "$DATA_PATH/entries";
        val DATE_FORMAT = "YYYY-MM-dd";

        public fun s3Client(): S3Client {
            return S3Client.builder()
                .httpClientBuilder(ApacheHttpClient.builder())
                .credentialsProvider(DefaultCredentialsProvider.create())
                .region(Region.US_EAST_2)
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

    public fun getFiles(
            fileName: String = "${SimpleDateFormat(DATE_FORMAT).format(Date())}/"
        ): List<SponsorItem> {

        var listReq: ListObjectsRequest = ListObjectsRequest.builder()
                                    .prefix("$BASE_PATH/$fileName")
                                    .bucket(BUCKET_NAME).build();

        var resp = s3Client.listObjects(listReq)
        val today = Date()

        var dayShift = 0;
        while (resp.contents().size < 100 && dayShift < 30) {
            var fileName = "${SimpleDateFormat(DATE_FORMAT).format(today.subtractDays(dayShift))}/"
            listReq = ListObjectsRequest.builder()
                .prefix("$BASE_PATH/$fileName")
                .bucket(BUCKET_NAME).build();
            s3Client.listObjects(listReq)
        }

        val response = resp.contents().map { it ->
            gson.fromJson(String(s3Client.getObject(
                GetObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(it.key())
                    .build()
            ).readAllBytes()), SponsorItem::class.java)
        }

        return response;
    }

    public fun writeToFile(fileName: String, obj: Any): String {
        val date = SimpleDateFormat(DATE_FORMAT).format(Date())

        var req = PutObjectRequest.builder()
            .bucket(BUCKET_NAME)
            .key("$BASE_PATH/$fileName")
            .build();

        val resp = s3Client.putObject(req, RequestBody.fromString(gson.toJson(obj)))

        return resp.toString();

    }

    override fun close() {
        s3Client.close();
    }

    override fun getSponsorList(
        personality: String,
        sponsor: String,
        platform: String,
        code: String,
        post: String,
        start: Date,
        added: Date,
        verified: Date?,
        valid: Boolean?,
        scam: Boolean?
    ): List<SponsorItem> {

        return getFiles()
            .filter { it -> if (personality != "") it.personality.like(personality) else true }
            .filter { it -> if (sponsor != "") it.sponsor.like(sponsor) else true }
            .filter { it -> if (platform != "") it.platform.like(platform) else true }
            .filter { it -> if (code != "") it.code.like(code, 2) else true }
            .filter { it -> if (post != "") it.post.like(post, 10) else true }
            .filter { it -> if (start != Date()) it.start.equals(start) else true }
            .filter { it -> if (added != Date()) it.added.equals(added) else true }
            .filter { it -> if (verified != null) it.verified?.equals(verified) ?: false else true }
            .filter { it -> if (valid != null) it.valid else true }
            .filter { it -> if (scam != null) it.scam else true }
    }

    override fun addSponsorItem(item: SponsorItem): String {
        var date = SimpleDateFormat(DATE_FORMAT).format(Date());

        return writeToFile("${date}/${item.sponsor}-${item.personality}_${item.added}.json", item)
    }

    override fun removeSponsorItem(
        personality: String,
        sponsor: String,
        platform: String,
        start: Date,
        added: Date,
        scam: Boolean?
    ): SponsorItem {
        TODO("Not yet implemented")
    }

    override fun getPersonalityList(): List<Personality> {
        TODO("Not yet implemented")
    }

    override fun addPersonality(person: Personality) {
        TODO("Not yet implemented")
    }

    override fun removePersonality(): Personality {
        TODO("Not yet implemented")
    }

    override fun getPlatformList(): List<Platform> {
        TODO("Not yet implemented")
    }

    override fun addPlatform(plat: Platform) {
        TODO("Not yet implemented")
    }

    override fun removePlatform(): Platform {
        TODO("Not yet implemented")
    }

    override fun addFromFile(file: File) {
        TODO("Not yet implemented")
    }
}