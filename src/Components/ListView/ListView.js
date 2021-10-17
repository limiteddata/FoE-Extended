
import React, { useState, } from 'react';
import { v4 as uuid} from 'uuid';
import './ListView.scss';

export default function ListView({data}) {
    return(
        <table>
            <thead>
                <tr className={'table-header'}>
                    { data.header.map(item =>( <th key={uuid()}>{item}</th>) ) }
                </tr>
            </thead>
            <tbody>
                {
                    data.content.map(row => (
                        <tr key={uuid()}>
                        { row.map(item => (<td key={uuid()}>{item}</td>)) }
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}
