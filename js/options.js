function save_options(){
    // TODO
    console.log('Options saved!');
};

document.addEventListener('DOMContentLoaded', function(){
    // code converted to pure JS from flat-ui toggle
    var toggleNotifications = document.getElementById('toggle_notifications');

    toggleNotifications.addEventListener('click', function(){
        var onInput = document.getElementById('toggle_input_on');
        var offInput = document.getElementById('toggle_input_off');
        if (onInput.checked){
            this.className = 'toggle toggle-off';
            onInput.checked = false;
            offInput.checked = true;
        }
        else if (offInput.checked){
            this.className = 'toggle';
            offInput.checked = false;
            onInput.checked = true;
        }
    });
});
