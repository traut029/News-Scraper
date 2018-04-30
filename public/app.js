console.log("test")
$("#article-div").on("click",".article-notes", function(event){
    $("#modal-notes").empty()
    console.log("button clicked")
 var currentId= $(this).parent().parent().attr("id")
 $(".new-note-button").attr("id",currentId)
 $(".modal-title").text("Notes for "+currentId)
console.log(currentId)
    $.ajax("/articles/"+currentId, {
        type: "GET",
    }).then(
        function (data) {
            console.log(data)
            console.log(data[0].notes[0].body)
            
            for(var i=0;i<data[0].notes.length;i++){
                $("#modal-notes").append("<div class='card text-center'>"+data[0].notes[i].body+"<button class='btn btn-primary btn-sm delete text-center'id='"+data[0].notes[i]._id+"'>Delete</button></div>")
                console.log(data[0].notes[i].body)
            }
        
        })
})
$(".new-note-button").on("click", function(event){
    console.log("button clicked")
    var newNote={
        body:$("#new-note-input").val().trim()
    }
    var currentId=this.id
    $.ajax("/articles/"+currentId, {
        type: "POST",
        data: newNote
    }).then( function (data){
        console.log(data)
        location.reload()
    })

})
$("#modal-notes").on("click",".delete", function(event){
    console.log("delete button clicked")
 //This is the note Id, not the article Id
    var currentId=this.id

    console.log(currentId)
    $.ajax("/note/"+currentId, {
        type: "DELETE",
    }).then( function (data){
        console.log(data)
        location.reload()
    })

})
$("#article-div").on("click",".delete-article", function(event){
    console.log("delete button clicked")
 
    var currentId= $(this).parent().parent().attr("id")

    console.log(currentId)
    $.ajax("/article/"+currentId, {
        type: "DELETE",
    }).then( function (data){
        console.log(data)
        location.reload()
    })

})