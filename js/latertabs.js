/**
 * LaterTabs
 *
 * @license: MIT (check LICENSE file for details)
 * @version: v0.0.4
 *
 */

"use strict";

var LaterTabs = {

    tabs: {},

    options: {},

    timer: null,

    init: function(callback){
        chrome.storage.sync.get('tabs', function(value){
            if (value.hasOwnProperty('tabs')){
                LaterTabs.tabs = value.tabs;
            }
            else{
                LaterTabs.tabs = {};
            }
            // read options
            chrome.storage.sync.get('options', function(value){
                LaterTabs.options = value.options;
                if (callback){ callback(); }
            });
        });

        var saveButton = document.getElementById('save_tab_button');
        var saveAllButton = document.getElementById('save_all_button');
        var settingsButton = document.getElementById('settings_button');
        var searchField = document.getElementById('search_field');

        saveButton.addEventListener('click', function(){
            LaterTabs.saveCurrent(LaterTabs.createList);
        });

        saveAllButton.addEventListener('click', function(){
            LaterTabs.saveAll(LaterTabs.createList);
        });

        settingsButton.addEventListener('click', function(){
            chrome.tabs.create({ url: "options.html" });
        });

        searchField.addEventListener('keyup', function(e){
            var searchField = document.getElementsByClassName('todo-search')[0];
            searchField.className = 'todo-search todo-search-loading';
            clearTimeout(LaterTabs.timer);
            if (this.value.length > 0){
                if (e.keyCode === 13){
                    LaterTabs.search(this.value, LaterTabs.createList);
                }
                else{
                    var self = this;
                    LaterTabs.timer = setTimeout(function(){
                        LaterTabs.search(self.value, LaterTabs.createList);
                    }, 1000);
                }
            }
            else{
                if (e.keyCode === 13){
                    LaterTabs.createList();
                }
                else{
                    LaterTabs.timer = setTimeout(LaterTabs.createList, 1000);
                }
            }
        });

    },

    syncStorage: function(){
        chrome.storage.sync.set({tabs: LaterTabs.tabs});
    },

    save: function(item){
        if (typeof LaterTabs.tabs[item.url] != 'undefined'){
            return false;
        }
        LaterTabs.tabs[item.url] = item;
        LaterTabs.syncStorage();
        return true;
    },

    remove: function(url){
        url = url.replace(/&amp;/g, '&');
        if (LaterTabs.tabs[url]){
            delete LaterTabs.tabs[url];
            LaterTabs.syncStorage();
            LaterTabs.notify('Tab removed', url);
            return true;
        }
        return false;
    },

    saveCurrent: function(callback){
        chrome.tabs.getSelected(null, function(tab){
            LaterTabs.save({ url: tab.url, title: tab.title });
            LaterTabs.notify('Tab saved', tab.url);
            if (callback){ callback(); }
        });
    },

    saveAll: function(callback){
        chrome.tabs.getAllInWindow(null, function(tabs){
            for (var i = 0, tlength = tabs.length; i < tlength; i++){
                LaterTabs.save({ url: tabs[i].url, title: tabs[i].title });
            }
            LaterTabs.notify('All tabs saved', '');
            if (callback){ callback(); }
        });
    },

    restore: function(url){
        chrome.tabs.create({'url': url}, function(tab) {
            LaterTabs.notify('Tab restored', url);
        });
    },

    getSaved: function(){
        return LaterTabs.tabs;
    },

    search: function(term, callback){
        term = term.toLowerCase();
        var results = [];
        for (var i in LaterTabs.tabs){
            if (LaterTabs.tabs[i].title.toLowerCase().indexOf(term) !== -1){
                results.push(LaterTabs.tabs[i]);
            }
        }
        callback(results);
    },

    notify: function(title, text){
        if (!LaterTabs.options || LaterTabs.options.notifications){
            var notification = webkitNotifications.createNotification(
                chrome.extension.getURL('imgs/icon48.png'),
                title,
                text
            );
            notification.show();
        }
    },

    createList: function(items){
        if (!items){
            items = LaterTabs.tabs;
        }

        var htmlContent = '';
        var emptyList = false;

        for (var i in items){
            if (items[i] || items.hasOwnProperty(i)){
                htmlContent += '<li class="todo">';
                htmlContent += '<div class="todo-icon fui-time-24"></div>';
                htmlContent += '<div class="todo-content">';
                htmlContent += '<h4 class="todo-name elps">' + items[i].title + '</h4>';
                htmlContent += '<p class="elps">' + items[i].url + '</p></div>';
                htmlContent += '<div class="settings_btn_16 pull-right fui-cross-16 me"></div></li>';
            }
        }

        if (htmlContent == ''){
            emptyList = true;
            htmlContent += '<li class="todo">';
            htmlContent += '<div class="todo-content">';
            htmlContent += '<h4 class="todo-name elps">No items</h4>';
            htmlContent += '</div>';
            htmlContent += '</li>';
        }
        document.getElementById('tab_list').innerHTML = htmlContent;
        
        var tablist = !emptyList ? document.getElementsByTagName('li') : [];

        for (var i = 0, tlength = tablist.length; i < tlength; i++){

            tablist[i].addEventListener('click', function(){
                var tabURL = this.getElementsByTagName('p')[0].innerHTML;
                LaterTabs.restore(tabURL);
            });

            var deleteButton = tablist[i].getElementsByClassName('fui-cross-16')[0];
            deleteButton.addEventListener('click', function(e){
                e.stopPropagation();
                var tabURL = this.previousSibling.children[1].innerHTML;
                LaterTabs.remove(tabURL);
                LaterTabs.createList(); // quick hack to update list
            });
        }

        // remove the loading field if present
        var loadingField = document.getElementsByClassName('todo-search-loading');
        if (loadingField.length > 0){ loadingField[0].className = 'todo-search'; }
    }
};

(function(){
    LaterTabs.init(LaterTabs.createList);
})();
