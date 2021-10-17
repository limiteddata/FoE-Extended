import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import ModalWindow from '../../ModalWindow/ModalWindow';
import ListView from '../../ListView/ListView';
import URLResolver from '../../../../utils/URLResolver';
const icon1 = URLResolver('/src/assets/img/icon1.png')
const icon2 = URLResolver('/src/assets/img/icon-128.png')

export default function Window3({open,setOpen}) {
    const [data, setData] = useState({
        header:['Type', 'Location', 'Time'],
        content:[
            [(<img src={icon1} alt={'icon'}/>), 'In water', 'Tomorrow'],
            [(<img src={icon2} alt={'icon'}/>), 'In water1', 'Tomorrow'],
            ['Water', 'In water2', 'Tomorrow'],
            ['Water', 'In water3', 'Tomorrow'],
        ]
    })
    return(
        <ModalWindow
        title={'Modal Menu'}
        initialWidth={400}
        initialHeight={350}
        minWidth={120}
        minHeight={80}
        settings={()=>alert('open settings window')}
        openWindow={open}
        closeWindow={()=>setOpen(false)}>
        <ListView
        data={data}
        />
        </ModalWindow>
  
    )
}
