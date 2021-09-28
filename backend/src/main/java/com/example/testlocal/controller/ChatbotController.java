package com.example.testlocal.controller;

import org.apache.tomcat.util.codec.binary.Base64;
import org.apache.tomcat.util.json.JSONParser;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;

@Controller
public class ChatbotController {

    private static String secretKey = "[시크릿키]";
    private static String apiUrl = "[apiUrl키]";

    @MessageMapping("/sendMessage")
    @SendTo("/topic/public")
    public String sendMessage(@Payload String chatMessage) throws IOException {

        URL url = new URL(apiUrl);

        String message =  getReqMessage(chatMessage);
        String encodeBase64String = makeSignature(message, secretKey);

        // api서버 접속 (서버 -> 서버 통신)
        HttpURLConnection con = (HttpURLConnection)url.openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/json;UTF-8");
        con.setRequestProperty("X-NCP-CHATBOT_SIGNATURE", encodeBase64String);

        con.setDoOutput(true);
        DataOutputStream wr = new DataOutputStream(con.getOutputStream());

        wr.write(message.getBytes("UTF-8"));
        wr.flush();
        wr.close();
        int responseCode = con.getResponseCode();

        BufferedReader br;

        if(responseCode==200) { // 정상 호출

            BufferedReader in = new BufferedReader(
                    new InputStreamReader(
                            con.getInputStream(), "UTF-8"));
            String decodedString;
            String jsonString = "";
            while ((decodedString = in.readLine()) != null) {
                jsonString = decodedString; //jsonString에 값 받아오기
            }

            //받아온 값을 세팅하는 부분
            //JSONParser jsonParser = new JSONParser();
            JSONParser jsonParser = new JSONParser(jsonString);
            try {
                JSONObject jsonObject = (JSONObject)jsonParser.parse();


                // "bubbles": [ {"type": "text",
                //"data" : { "description" : "postback text of welcome action" } } ],
                //"event": "open"
                JSONArray bubblesArray = (JSONArray)jsonObject.get("bubbles");
                JSONObject bubbles = (JSONObject)bubblesArray.get(0);

                JSONObject data = (JSONObject)bubbles.get("data");
                String description = "";
                description = (String)data.get("description");
                chatMessage = description;

            } catch (Exception e) {
                System.out.println("error");
                e.printStackTrace();
            }

            in.close();
        }

        else {  // 에러 발생
            chatMessage = con.getResponseMessage();
        }
        return chatMessage;
    }

    //보낼 메세지를 네이버에서 제공해준 암호화로 변경해주는 메소드
    public static String makeSignature(String message, String secretKey) {

        String signatureHeader = "";

        // 요청 Signature 헤더
        try {
            byte[] secrete_key_bytes = secretKey.getBytes("UTF-8");

            SecretKeySpec secretKeySpec = new SecretKeySpec(secrete_key_bytes, "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);

            byte[] signature  = mac.doFinal(message.getBytes("UTF-8"));
            signatureHeader = Base64.encodeBase64String(signature );

            return signatureHeader;

        } catch (Exception e){
            System.out.println(e);
        }

        return signatureHeader;

    }

    //보낼 메세지를 네이버 챗봇에 포맷으로 변경해주는 메소드
    public static String getReqMessage(String sendMessage) {

        String requestBody = "";

        try {

            JSONObject jsonObject = new JSONObject();

            long timestamp = new Date().getTime();

            //System.out.println("##"+timestamp);

            jsonObject.put("version", "v2");
            // userid는 유일한 키값이면 아무거나 가능
            // 일단 예시 값 넣어두기
            jsonObject.put("userId", "U47b00b58c90f8e47428af8b7bddc1231heo2");  
            jsonObject.put("timestamp", timestamp);

            JSONObject bubbles_obj = new JSONObject();

            bubbles_obj.put("type", "text");

            JSONObject data_obj = new JSONObject();
            data_obj.put("description", sendMessage);

            bubbles_obj.put("type", "text");
            bubbles_obj.put("data", data_obj);

            JSONArray bubbles_array = new JSONArray();
            bubbles_array.add(bubbles_obj);

            jsonObject.put("bubbles", bubbles_array);
            jsonObject.put("event", "send");

            requestBody = jsonObject.toString();

        } catch (Exception e){
            System.out.println("## Exception : " + e);
        }

        return requestBody;
    }
}
