import React, {Component} from 'react';
export default ListenerUtil ={

    /**
     * 移除参数外的所有监听，不传参数则移除所有监听
     * @param Listeners
     */
    remove(Listeners){
        Object.keys(this).forEach((key) =>{
            if('remove'!= key && 'removeIn'!= key && (!Listeners || Listeners.indexOf(key)==-1)){
                 //console.log('移除监听：'+key);
                if(this[key]){
                    this[key].remove();
                }
                delete this[key];
            }
        });
    },
    /**
     * 移除参数内的监听
     * @param Listeners
     */
    removeIn(Listeners){
        Object.keys(this).forEach((key) =>{
            if('remove'!= key && 'removeIn'!= key && Listeners && Listeners.indexOf(key)!=-1){
                // console.log('移除监听：'+key);
                this[key].remove();
                delete this[key];
            }
        });
    }
}