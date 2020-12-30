<?php
session_start();


$method = $_SERVER["REQUEST_METHOD"];

switch(strtoupper($method)){     
    case "POST":
        postHandler(requestBody());
        break;
    case "GET":
        getHandler();
        break;
    case "PUT":
        putHandler(requestBody());
        break;
    case "DELETE":
        deleteHandler();
    default:
        returnError("Unsopported request method");
}

function validRegistrationAttempt($json){
     return hasCredentials($json) && isset($json["nickname"]);
}

function hasCredentials($json){
    return isset($json["email"]) && isset($json["password"]);
}

function hasAction($json,$action){
    return isset($json["action"]) && $json["action"] === $action;
}

function hashPassword($plainPassword){
    $salt ="f7e43_=7FAa5^$@#";
    return sha1($plainPassword . $salt);
}

function putHandler($json){
    if(hasAction($json,"register")){
        register($json);
    }else if(hasAction($json,"setArrivedMessages")){
        updateMessages($json,"ARRIVED");
    }else if(hasAction($json,"setSeenMessages")){
        updateMessages($json,"SEEN");
    }
    else{
        returnError("unsupported action for this method");
    }
}
function postHandler($json){
    if(hasAction($json,"login")){
       login($json);
    }
   else if(hasAction($json,"sendMessage"){
        sendMessage($json);
    }
}
function deleteHandler(){
    logout();
}
function getloggdUserId(){
    return "aa";
}
function getHandler(){
    if($userId = getloggdUserId()){
        $db=getDb();
        $allmessages=[];
        
        //get all messages sent from this user
        $stmt=$db->prepare("SELECT m.receiver_id, m.txt, m.created_at,m.status,u.nicname AS receiver_name FROM messages AS m JOIN users AS u NO m.receiver_id =u.id WHERE m.sender_id = ?");
        $stmt->execute([$userId]);
        $result =$stmt->fetchAll(PDO::FETCH_ASSOC);
        $allMaessages["msgsFromMe"] =$result;
        
        
        //get all messages sent to this user
        $stmt=$db->prepare("SELECT m.sender_id, m.txt, m.created_at,m.status,u.nicname AS sender_name FROM messages AS m JOIN users AS u NO m.sender_id =u.id WHERE m.receiver_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $allMaessages["msgsToMe"] =$result;
        
        
        returnSuccess($allMessages);
    }
    else{
        returnError("User is not logged in");
    }
}
                      
            

function register($json){
    if(validRegistrationAttempt($json)){
        $json["password"] = hashPassword($json["password"]);
        $stmt =getDb()->prepare("INSERT INTO users (email,password,nicname) VALUES (?,?,?)");
        if($stmt->execute([$json["email"],$json["password"],$json["nickname"]])){
            returnSuccess("User successfully created,you can login now");
            
        }else{
            returnError("The user cannot be created with these credential, please try again");
        }
    }else{
            returnError("Invalid registratuon attempt");
        }
}

function login($json){
    if(hasCredentials($json)){
        $json["password"] = hashPassword($json["password"]);
        $stmt=getDb()->prepare("SELECT id,nicname FROM user WHERE email =? AND password= ?");
        $stmt->execute([$json["email"],$json["password"]]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(count($result) === 1){
            $_SESSION["userId"] =$result[0]["id"];
            $_SESSION["nicknaem"] =$result[0]["nicknaem"];
            returnsuccess(["nickname"=> $result[0]["nicknaem"]]);
        }else{
             returnError("no user found with given credentials");
        }
        
    }else{
             returnError("Invalid login attempt");
        }
}

            
function logout(){
    unset($_SESSION["userId"]);
    unset($_SESSION["nicname"]);
    returnSuccess("Logout done");
    
}            
            
function sendMessage($json){
    if($userId = getLoggedUserId()){
        $stmt = getDb()->prepare("INSERT INTO meessages(sender_id,receiver_id,txt,status) VALUES(?,?,?,'SENT')");
        if($r=$stmt->execute([$userId,$json["receiverId"],$json["txt"]])){
            return  returnSuccess("Message is send");
        } 
    }
    returnError("Failed to send message");    
} 

function updateMessages($json, $status){
    if($userId=getLoggedUserId()){
        $questionMarks =array_fill(0, count($json["msgsIds"]),"?");
        $stmt =getDb()->prepare("UPDATE messages SET status =? WHERE receiver_id =? AND id IN (".implode(",",$questionMarks).")");
        if($stmt->execute(array_merge([$status,$userId], $json["msgsIds"]))){
            return returnSuccess("Message successfully updated");
        }
    }
     returnError("Failed to update messages");
}
            
function validJsonBody($body){
    return is_array($body) && isset($body["action"]);
}
            
function getLoggedUserId(){
    if(isset($_SESION["userId"])){
        return $_SESSION["userId"];
    }
    return false;
}
            
function responseBody($success,$data){
    return json_encode(["success" => $success,"data" =>$data]);
}

function requestBody(){
    return json_decode(file_get_contents('php://input'),true);
    
}


function returnError($data){
    header('HTTP/1.1 400 Bed request',true,400);
    header('Content-Type: application/json');
    die(responseBody(false,$data));
}


function returnSuccess($data){
    header('HTTP/1.1 200 OK',true,200);
    header('content-Type: application/json');
    echo(requestBody(true,$data));
}
            
function getDb(){
    $host     ="127.0.0.1";
    $dbName   ="tabel";
    $username ="root";
    $password ="";
    return new PDO("mysql:host=$hostname;dbname=$tabel",$username,$password);
   // return new PDO("mysql:host=$host;dbname=$dbName");
    // new PDO('mysql:host=localhost;dbname=test', $user, $pass);
    
}
 

?>