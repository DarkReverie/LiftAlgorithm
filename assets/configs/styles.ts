import { TextStyle } from 'pixi.js'
export const TextStyles = {
    buttonText: new TextStyle({
        fontSize: 68,
        fill: 0xffffff,
        fontWeight: "bold",
        align: "center",
    }),

    popupTitleWin: new TextStyle({
        fontSize: 48,
        fill: 0x00ff00,
        fontWeight: "bold",
        align: "center",

    }),

    popupTitleLose: new TextStyle({
        fontSize: 48,
        fill: 0xff4444,
        fontWeight: "bold",
        align: "center",

    }),
    popupButtonText: new TextStyle({
        fontSize: 48,
        fill: 0xffffff,
        fontWeight: "bold",
        align: "center"
    }),
    counterText: new TextStyle({
        fontSize: 140,
        fill: 0xffffff,
        fontWeight: "bold",
        align: "center",

    }),
    enemyCounterTitle: new TextStyle({
        fontSize: 140,
        fill: "#ffcc00",
        fontWeight: "bold",
    })
}


export const UI = {
    buttonPadding: 40,
    cornerRadius: 20,
    buttonColor: 0x2c2d2d,
    buttonHoverColor: 0x6a7070,
}
