import { Component } from "react"

/**
 * 
 * @param {Object} props 
 * @param {String} props.classNames 
 * @param {String} props.paragraphStyleClasses 
 * @param {Component} props.Icon
 * @param {String} props.title
 * @param {String} props.text
 * @returns 
 */
export const FloatingComponent = (props) => {
    return (<div className={`absolute ${props.classNames} flex gap-4 items-center`}>
        {props.Icon && <props.Icon className="text-(--primary-color) font-bold" />}
        <div>
            <h2>{props.title}</h2>
            <p className={`${props.paragraphStyleClasses}`}>{props.text}</p>
        </div>
    </div>)
}