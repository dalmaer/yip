(function (exports) {
'use strict';

/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * Utilities for manipulating the shadow DOM used by custom yip elements.
 */
class util {

  /**
   * Parse and add a chunk of html to the given root element.
   *
   * @param {HTMLElement} root
   *
   *    The element to add the template to.
   *
   * @param {string} templateText
   *
   *    The template string to add.
   */
  static addTemplate(root, templateText) {
    const p = new DOMParser();
    const d = p.parseFromString(templateText, 'text/html');
    const child = d.body.firstChild;
    root.append(child);
    return child;
  }

  static buildSlot() {
    return document.createElement('slot');
  }

  static addElement(root, elementName, hasSlot=true) {
    const node = document.createElement(elementName);
    if (hasSlot) {
      node.append(util.buildSlot());
    }
    root.append(node);
    return node;
  }

  /**
   * TODO
   */
  static addScript(root, scriptText) {
  }

  /**
   * TODO
   */
  static addScriptLink(root, scriptUrl) {
  }


  static addStyleLink(root, styleUrl) {
    const node = document.createElement('link');
    node.rel = "stylesheet";
    node.href = styleUrl;
    root.append(node);
    return node;
  }

  /**
   * TODO
   */
  static addStyle(root, styleText) {
  }

  /**
   * TODO
   */
  static addStyleSelector(root, selector) {
  }

  /**
   * Apply classes to the given node.
   * 
   * @param {HTMLElement} targetNode
   *
   *    The element to apply classes to.
   *
   * @param {object} classes
   *
   *    An object containing the class definitions in the format
   *    className: true/false as to whether the class should be applied.
   *
   */
  static applyClasses(targetNode, classes) {
    for (let className in classes) {
      if (classes[className]) {
        targetNode.classList.add(className);
      }
    }
  }

  /**
   * Copy attributes from one node to another.
   * 
   * @param {HTMLElement} sourceNode
   *
   *    The element to copy attributes from.
   *
   * @param {HTMLElement} targetNode
   *
   *    The element to copy attributes to.
   *
   * @param {object} attrsList
   *
   *    The attributes to copy, in the format
   *    attribute: true/false as to whether the attribute should be copied.
   *
   */
  static copyAttrs(targetNode, sourceNode, attrsList) {
    for (let i = 0; i < attrsList.length; i++) {
      const attrName = attrsList[i];
      const val = sourceNode.getAttribute(attrName);
      if (val || val == '') {
        targetNode.setAttribute(attrName, val);
      }
    }
  }
}


/**
 * Yip element class.
 *
 * You should subclass this to create a new element type to add DOM, behaviour,
 * styling, etc.
 *
 */
class Element extends HTMLElement {

  constructor() {
    super();
    
    // These are the main yip state variables
    
    /**
     * The Shadow root.
     *
     * This is a DOM node that is rendered in place of this element. You can
     * treat it as the parent node for this element. All yipAdd* methods append
     * nodes to this element.
     */
    this.yipRoot = this.yipBuildRoot();

    /**
     * The main renderable node.
     *
     * All yipAdd* methods set this attribute. If you don't use them, you should
     * set the attribute yourself as the main renderable node.
     */
    this.yipNode = null;

    /**
     * The default slot.
     *
     * The slot element is where child nodes will be added to your custom
     * element. It is critical t add if you wish your element to contain other
     * elements.
     *
     * All yipAdd* methods set this attribute.
     */
    this.yipSlot = null;

    // Build the thing!
    this.yipBuild();
    
  }

  /**
   * Override to build the DOM.
   *
   * This method is called by the constructor, and is the main entry point for
   * building the element behind the scences.
   *
   * You should override it to do anything, for example:
   *
   *     yipBuild {
   *       this.yipAddElement('button');
   *     }
   */
  yipBuild() {
  }

  /**
   * The default template.
   *
   *   @return {string} The template's content as a string.
   *
   * Override this to return a string that is the template to be parsed and
   * rendered. You don't need to include the `<template>` tags or anything like
   * that. Just a string of any DOM.
   *
   * This is just a convention, really. You can pass any string into
   * {@link yipAdd} to ad that template instead or also.
   */
  yipTemplate() {
    return '';
  }

  /**
   * Add the template string as HTML to the shadowDom.
   *
   * @param {string} templateContent
   *
   *     The content of the template to load and add to the shadow root.
   *
   *     If !templateContent, the value will be grabbed from calling
   *     {@link yipTemplate}. But that's implicit and nasty, so possibly pass it
   *     in explicitly.
   */
  yipAdd(templateContent) {
    if (!templateContent) {
      templateContent = this.yipTemplate();
    }
    this.yipNode = util.addTemplate(this.yipRoot, templateContent);
    console.log(this.yipNode);
    this.yipFindSlot();
    return this.yipNode;
  }

  yipFindSlot() {
    this.yipSlot = this.yipNode.querySelector('slot');
  }

  /**
   * Create and add an element to the shadow root.
   *
   * @param {string} elementName
   *
   *     The element to create, e.g. `'div'`.
   *
   * @param {boolean} hasSlot
   *
   *     Whether to create and add a slot to the child. Usually for single
   *     node elements, you will just use the default `true` to enable your
   *     element to have children.
   *
   * This simply creates
   */
  yipAddElement(elementName, hasSlot=true) {
    this.yipNode = util.addElement(this.yipRoot, elementName, hasSlot);
    this.yipFindSlot();
    return this.yipNode;
  }

  /**
   * The children of this element.
   *
   * This is really just the default slot's assigned nodes.
   */
  get yipChildren() {
    return this.yipSlot.assignedNodes();
  }

  /**
   * The first child of this element, i.e. in the slot.
   */
  get yipFirstChild() {
    return this.yipChildren[0]
  }

  /**
   * Copy attributes to the element's node.
   */
  yipCopyAttrs(attrsList) {
    copyAttrs(this.yipNode, this, attrsList);
  }

  /**
   * Apply classes to the element's main node.
   *
   * @param {object} classes
   *
   *    An object containing the class definitions in the format
   *    className: true/false as to whether the class should be applied.
   *
   * You should use this method to apply conditional classes to the element's
   * main node during {@link yipBuild}, for example:
   *
   *     this.yipApplyClasses({
   *         isBlinking: this.attributes.blinking
   *     })
   *
   * which when an element is created:
   *
   *     <my-element blinking>
   *
   * The class `isBlinking` will be applied to the main node.
   *
   *
   */
  yipApplyClasses(classes) {
    util.applyClasses(this.yipNode, classes);
  }

  yipAddStyleLink(styleUrl) {
    util.addStyleLink(this.yipRoot, styleUrl);
  }

  /**
   * Build the shadow root.
   */
  yipBuildRoot() {
    return this.attachShadow({mode: 'open'});
  }

  /**
   * Emit a custom event.
   */
  yipEmit(name) {
    this.dispatchEvent(new Event(name));
  }

}


/**
 * Add a new Yip Element.
 *
 * @param {String} elementName
 *
 *   The name of the element to register
 *
 * @param {class} controllerType
 *
 *   The type of the controller.
 *
 */
function register(elementName, elementType) {
  customElements.define(elementName, elementType);
  return elementType;
}

exports.util = util;
exports.Element = Element;
exports.register = register;

}((this.yip = this.yip || {})));
