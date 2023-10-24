$('input[type=radio]').click(function (e) {
    var id = `#${e.target.value}`;
    console.log(id);
    sessionStorage.setItem("categorySelection", JSON.stringify({checked: `${id}`}));
    $('#categoryForm').submit();
});

$(document).ready(function () {
    var data = sessionStorage.getItem('categorySelection');
    if (data !== null) {
        var selection = JSON.parse(data).checked;
        $(`${selection}`).attr('checked', true);
    } else {
        $('#general').attr('checked', true);
    }
});

var screenWidth = window.innerWidth;



