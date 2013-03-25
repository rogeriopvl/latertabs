function saveOptions(options){
    chrome.storage.sync.set({options: options});
};

function getOptions(callback){
    chrome.storage.sync.get('options', function(value){
        if (!value.options){
            // notifications on by default
            value = { notifications: true };
            saveOptions(value);
            callback(value);
        }
        else{
            callback(value.options)
        }
    });
}

document.addEventListener('DOMContentLoaded', function(){
    getOptions(function(options){
        // code converted to pure JS from flat-ui toggle
        var toggleNotifications = document.getElementById('toggle_notifications');

        if (options.notifications){
            toggleNotifications.className = 'toggle';
        }
        else{
            toggleNotifications.className = 'toggle toggle-off';
        }

        toggleNotifications.addEventListener('click', function(){
            var onInput = document.getElementById('toggle_input_on');
            var offInput = document.getElementById('toggle_input_off');
            if (onInput.checked){
                this.className = 'toggle toggle-off';
                onInput.checked = false;
                offInput.checked = true;

                options.notifications = false;
            }
            else if (offInput.checked){
                this.className = 'toggle';
                offInput.checked = false;
                onInput.checked = true;

                options.notifications = true;
            }
            saveOptions(options);
        });

        // close button
        document.getElementById('close_options').addEventListener('click', function(){
            window.close();
        });
    });
});

