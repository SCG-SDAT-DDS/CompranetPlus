<?php

namespace App\Helper;
class CommomHelper{

    public static function curlopt($url_curl,$options){
        $curl = curl_init($url_curl);
          curl_setopt_array($curl,$options);
          $response = curl_exec($curl);
          $error = curl_error($curl);
          curl_close($curl);
          if($error){
              $return = $error;
          }else{
              $return = $response;
          }
          return $return;
    }

    public static function responseController($code,$response){
        http_response_code($code);
        echo json_encode($response);
        exit;
    }

    public static function getResultControllerDefault(){
        return [
            //'code' => 200,
            'status' => true,
            'msg' => [],
            //'data' => []
        ];
    }

}

?>
