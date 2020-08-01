/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import DataView = powerbi.DataView;
import DataViewCategorical = powerbi.DataViewCategorical;
import PrimitiveValue = powerbi.PrimitiveValue;

import { VisualSettings } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private table: HTMLTableElement;
    private thead: HTMLTableSectionElement;
    private tbody: HTMLTableSectionElement;

    private curDate: Date;
    private curYear: number;
    private curMonth: number;
    private curDay: number;

    constructor(options: VisualConstructorOptions) {
        this.curDate = new Date();
        this.curYear = this.curDate.getFullYear();
        this.curMonth = this.curDate.getMonth();
        this.curDay = this.curDate.getDate();

        this.target = options.element;

        if (document) {
            // Создание таблицы для будущего календаря
            let tr: HTMLTableRowElement = document.createElement('tr');
            let tdPrev: HTMLTableDataCellElement = document.createElement('td');
            tdPrev.id = 'prev';
            tdPrev.innerText = '‹';
            let tdNext: HTMLTableDataCellElement = document.createElement('td');
            tdNext.id = 'next';
            tdNext.innerText = '›';
            let tdYearmonth: HTMLTableDataCellElement = document.createElement('td');
            tdYearmonth.id = 'yearmonth';
            tdYearmonth.colSpan = 5;

            this.table = document.createElement('table');
            this.thead = this.table.createTHead();
            this.tbody = this.table.createTBody();

            tr.appendChild(tdPrev);
            tr.appendChild(tdYearmonth);
            tr.appendChild(tdNext);

            this.thead.appendChild(tr);
            this.table.appendChild(this.thead);
            this.table.appendChild(this.tbody);

            this.target.appendChild(this.table);
        }
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options.dataViews[0];
        const categoricalDataView: DataViewCategorical = dataView.categorical;

        if (!categoricalDataView ||
            !categoricalDataView.categories ||
            !categoricalDataView.categories[0] ||
            !categoricalDataView.values) {
            return;
        }

        const categoryFieldIndex = 0;
        const measureFieldIndex = 0;
        // Категории - столбец дат
        let categories: PrimitiveValue[] = categoricalDataView.categories[categoryFieldIndex].values;
        let values: PrimitiveValue[] = categoricalDataView.values[measureFieldIndex].values;

        this.tbody.innerHTML = this.createCalendar(
            this.curYear, this.curMonth,
            categories, values
        );

        // Задаём размеры визуала равные размерам окна
        this.table.setAttribute('width', `${options.viewport.width}`);
        this.table.setAttribute('height', `${options.viewport.height}`);

        // Переключатель минус месяц
        let element = document.querySelector('#prev');
        const prev: HTMLElement = <HTMLElement>element;
        prev.onclick = () => {
            element = document.querySelector('#yearmonth');
            const yearmonth: HTMLElement = <HTMLElement>element;
            this.tbody.innerHTML = this.createCalendar(
                parseInt(yearmonth.dataset.year),
                parseInt(yearmonth.dataset.month) - 1,
                categories, values
            );
        }
        // Переключатель плюс месяц
        element = document.querySelector('#next');
        const next: HTMLElement = <HTMLElement>element;
        next.onclick = () => {
            element = document.querySelector('#yearmonth');
            const yearmonth: HTMLElement = <HTMLElement>element;
            this.tbody.innerHTML = this.createCalendar(
                parseInt(yearmonth.dataset.year),
                parseInt(yearmonth.dataset.month) + 1,
                categories, values
            );
        }
    }

    // Собираем данные с привызанных полей в 1 объект
    private getData(categories: PrimitiveValue[], values: PrimitiveValue[]) {
        const data = {};
        let catDate: Date;
        let i: number = 0;
        categories.forEach(category => {
            catDate = new Date(category.toString());
            data[`${catDate.getDate()}.${catDate.getMonth()}.${catDate.getFullYear()}`] = values[i];
            i++;
        })

        return data;
    }

    private createCalendar(year: number, month: number,
        categories: PrimitiveValue[], values: PrimitiveValue[]): string {
        let date = new Date(year, month),
            lastDay = new Date(year, month + 1, 0).getDate(), // Устанавливаем значение следующего месяца дня = 0, т.е. он будет указывать на последний день предыдущего месяца
            firstWeekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
            lastWeekDay = new Date(date.getFullYear(), date.getMonth(), lastDay).getDay(),
            months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            calendar = '<tr>';

        const data = this.getData(categories, values);

        // Заполняем пустые ячейки до первого числа месяца
        if (firstWeekDay != 0) {
            for (let i = 1; i < firstWeekDay; i++)
                calendar += '<td>';
        }
        else {
            for (let i = 0; i < 6; i++)
                calendar += '<td>';
        }

        for (let i = 1; i <= lastDay; i++) {
            if (i == this.curDay &&
                date.getFullYear() == this.curYear &&
                date.getMonth() == this.curMonth) { // Отмечаем текущий день
                calendar += '<td class="today">' + `<p>${i}</p><p>${data[`${i}.${date.getMonth()}.${date.getFullYear()}`] ?? ''}</p>`;
            }
            else {
                calendar += '<td>' + `<p>${i}</p><p>${data[`${i}.${date.getMonth()}.${date.getFullYear()}`] ?? ''}</p>`;
            }

            if (new Date(date.getFullYear(), date.getMonth(), i).getDay() == 0) { // Вс - новая строка
                calendar += '<tr>';
            }
        }

        // Добиваем таблицу пустыми ячейками, если нужно
        for (let i = lastWeekDay; i < 7; i++)
            calendar += '<td> ';

        const element = document.querySelector('#yearmonth');
        const yearmonth: HTMLElement = <HTMLElement>element;
        document.querySelector('#yearmonth').innerHTML = `${months[date.getMonth()]} ${date.getFullYear()}`;
        yearmonth.dataset.month = date.getMonth().toString();
        yearmonth.dataset.year = date.getFullYear().toString();

        return calendar;
    }
}