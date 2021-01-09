$(()=>{
    $(".chat,.regField").hide();
    //Finalprojectserver
    $.ajax({
        url:"api2.php",
        dataType:"json",
        type:"GET"
    }).then((res)=>{
        if(res.success){
            loggedIn(res.data);
        }else{
            alertError(res.data);
        }
    });
    
    function alertSuccess(txt){
        $(".alert-success").text(txt).fadeIn().delay(2000).fadeOut();
    }
    
    function alertError(txt){
        $("alert-danger").text(txt).fadeIn().delay(2000).fadeOut();
    }
    
    function isEmpty(val){
        return String(val).trim().length === 0;
    }
    
    function loggedIn(data){
        $(".chat").show();
        $(".noChat").hide();
        $(".nickname").text(data.nickname);
        
        $("#totalMsgsCount").text(data.msgsFromMe.length + data.msgsToMe.length);
        $("#toMeCount").text(data.msgsToMe.length);
        $("#fromMeCount").text(data.msgsFromMe.length);
        
        updateArrivedToMe(data.msgsToMe);
        
        
        loadMsgsToList("#toMeList",data.msgsToMe);
        showChat("#toMeList>li","From ");
        
        loadMsgsToList("#fromMeList",data.msgsFromMe);
        showChat("#fromMeList>li","To ");
        
        function showChat(itemSelector,prefix){
            $(itemSelector).click((e)=>{
                const li = $(e.target);
                $("#chatTtl").text(prefix + li.text());
                $("#chatDesc").text(li.attr("data-txt"));
                const receivedMsgId =li.attr("data-msg-id");
                if(receivedMsgId){
                    updateSeenMsg(parseInt(receivedMsgId));
                }
            });
        }
            
        function loadMsgsTolist(listSelector,msgs){
            const arrows ={SENT: singleArrow(),ARRIVED: doubleArrow(),SEEN: doubleBlueArrow()};
            var list="";
            for(const odj of msgs){
                const receivedMsgId =obj.id || "";
                const contactId     = odj.receiver_id || odj.sender_id;
                let arrow ="";
                if(!receivedMsgId){
                    arrow=arrows[obj.status];
                }
                list += "<li class='list-group-item' data-txt='"+obj.txt+"' data-msg-id='"+receivedMsgId+"' data-contcact-id'"+contactId+"'><b>"+arrow+odj.contact+"</b> at "+odj.created_at+"</li>";
            }
            $(listSelector).html(list);      
        }
        function updateArrivedToMe(msgsToMe){
            const msgsIds=[];
            for(const obj of msgsToMe){
                msgsIds.push(obj.id);
            }
            $.ajax({
                url:"api2.php",
                type:"PUT",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                data: JSON.stringify({msgsIds,action: "setArrivedMessages"})
            });
        }
        function updateSeenMsg(msgId){
            $.ajax({
                url:"api2.php",
                type:"PUT",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                data: JSON.stringify({msgsIds: [msgId], action: "setSeenMessages"})
            });
        }
    }
    
    
    $("#regFormBtn").click(()=>{
        $(".regField").show();
        $(".loginField").hide();
        $("#fromTtl").text("Sing up form");
    });
    
    $("#backLogin").click(()=>{
        $(".regField").hide();
        $(".loginField").show();
        $("#fromTtl").text("Sing In form");
    });
    
    $("#registerBtn").click(()=>{
        const nickname     =$("#nicknameInput").val();
        const email        =$("#emailInput").val();
        const password     =$("#passwordInput").val();
        const passwordConf =$("#passwordConfInput").val();
        const errors       =[];
        
        if(isEmpty(nickname) || isEmpty(email) || isEmpty(password)){
            errors.push("All fields are required");
        }
        
        if(password != passwordConf){
            errors.push("password must match")
        }
        
        if(email.length > 0){//Hes errors
            alertError(errors);
        }else{
            $.ajax({
                url:"api2.php",
                type:"PUT",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                data: JSON.stringify({email,password,nickname,action:"register"})
            }).then((res)=>{
                if(res.success){
                    alertSuccess(res.data);
                }else{
                    alertError(res.data);
                }
            });
        }
        
    });
    
    
  $("#loginBtn").click(()=>{
      const email    = $("#emailInput").val();
      const password = $("#passwordInput").val();
      
      if(isEmpty(email) || isEmpty(password)){
          alertError("Both fields are required");
      }else{
          $.ajax({url:"api2.php",
                type:"POST",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                data:JSON.stringify({email,password,action:"login"})
            }).then((res)=>{
                if(res.success){
                   location.reload();
                }else{
                    alertError(res.data);
                }
            });
      }
  });
    
              
   //Read data
    $("#getBtn").clone(()=>{
        $.ajax({
            url:"api2.php",
            dataType:"json",
            type:"GET"
        }).then((res)=>{
            if(res.success){
                let lis ="";
                for(const id in res.data){
                    lis += "<li data-id='"+id+"'>"+res.data[id]+"</li>"; 
                }
                $("#foodsList").html(lis);
                $("#foodsList>li").click((e)=>{
                    const foodId   =$(e.target).attr("data-id");
                    const foodName =$(e.target).text();
                    $("#editModal").show();
                    $("#editFood").attr("data-id",foodId).val(foodName);
                });
                
            }
        });
        
        
    });
    
    //delete data
    $("#logoutBtn").click(()=>{
        $.ajax({
            url: "api2.php",
            type:"DELETE",
            dataType:"json"
        }).then((res)=>{
            if(res.success){
                location.reload();
            }
        });
    });
    
    $("#sendMsgBtn").click(()=>{
        const txt = $("#sendMsgInput").val();
        const receiverId = $("#sendMsgInput").attr("data-contact-id");
        
        if(isEmpty(txt)){
            alertError("Cannot send empty message");
        }else{
            $.ajax({
                url:"api2.php",
                type:"POST",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                data:JSON.stringify({receiverId,txt,action: "sendMessage"})
            }).then((res)=>{
                if(res.success){
                   $("#sendMsgInput").val("");
                    alertSuccess(res.data);
                }else{
                    alertError(res.data);
                }
            });
            
        }
    });
    
    
    
    function singleArrow(){
        return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15"><path fill="#92A58C" d=M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-5.15.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-51z"></phath></svg>';
    }
    
    function doubleArrow(arrowColor){
        const color = arrowColor || "#92A58C";
         return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15"><path fill="'+arrowColor+'" d=M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.32l-.378.483a.418.418 0 0 0 .036.541l1.32 1-266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.61.063L4.566 9.879a.32.32 0 6 1-.484.033L1.891 7.69a.366.366 0 0 0-.515.006l-423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0-0.63-51z"></phath></svg>';
    }
    
    
    function doubleBlueArrow(){
        return doubleArrow("#4FC3F7");
    }
    
});
            
    