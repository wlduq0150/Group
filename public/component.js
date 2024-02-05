class Group extends HTMLElement {
    
    connectedCallback() {
        /** @type string */
        let title = this.getAttribute('title');
        /** @type string */
        let member = this.getAttribute('member');
        /** @type string */
        let tier = this.getAttributeNames('tier');
        /** @type string */
        let owner = this.getAttributeNames('owner');
        /** @type string */
        let queue = this.getAttributeNames('queue');
        /** @type [bool, bool, bool, bool, bool, bool] */
        let pos = eval(this.getAttributeNames('pos'));

        this.innerHTML = `
<tr>
    <td>${title}</td>
    <td>${member}</td>
    <td>${tier}</td>
    <td>${queue}</td>
    <td>${owner}</td>
    <td>
        <img src="./img/position/none.png" ${pos[0]}>
        <img src="./img/position/jungle.png" ${pos[1]}>
        <img src="./img/position/top.png" ${pos[2]}>
        <img src="./img/position/mid.png" ${pos[3]}>
        <img src="./img/position/bottom.png" ${pos[4]}>
        <img src="./img/position/support.png" ${pos[5]}>
    </td>
</tr>
`
    }

}

customElements.define("group-tag", Group);