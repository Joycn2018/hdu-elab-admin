///<reference path="../../../../../node_modules/@angular/forms/src/model.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {ArrangedService} from './arranged.service';
import {NzMessageService} from 'ng-zorro-antd';
import {SessionStorageService} from '@core/storage/storage.service';
import {Router} from '@angular/router';


@Component({
    selector: 'app-arranged',
    templateUrl: 'arranged.component.html',
    styleUrls: ['./arranged.component.less'],
    providers: [ArrangedService]
})

export class ArrangedComponent implements OnInit {

       constructor(private _storage: SessionStorageService, private router: Router,
                private ArrangedService: ArrangedService, private _message: NzMessageService) {
    }
    simpleOrderList = [];
    orderDetails = [];
    lab = [];
    apiUrl = [
        'http://aliyun.charlesxu.cn:8080/LabManager/order/getFinishedSimpleOrderListByLabId',
        'http://aliyun.charlesxu.cn:8080/LabManager/order/getOrderByLabId',
        'http://aliyun.charlesxu.cn:8080/LabManager/order/getOrderById',
        'http://aliyun.charlesxu.cn:8080/LabManager/user/getUserByUserName',
        'http://aliyun.charlesxu.cn:8080/LabManager/lab/getLabById',
        'http://aliyun.charlesxu.cn:8080/LabManager/semester/getNowSemester', // 5
    ];
    // 获取学期
    nowSemester = {
        nowSemester: '',
        maxWeek: 17
    };
    private getSemester() {
        this.ArrangedService.executeGET(this.apiUrl[5])
            .then((result: any) => {
                const res = JSON.parse(result['_body']);
                if (res['result'] === 'success') {
                    this.nowSemester = res['NowSemester'];
                }
            });
    }
    // 获取预约列表
    private _getData = () => {
        this.getSemester();
        this.ArrangedService.executeHTTP(this.apiUrl[0], {labId: this._storage.get('labId')})
            .then((result: any) => {
                const data = JSON.parse(result['_body'])['SimpleOrder'];
                for (let i of data) {
                    i.expand = false;
                    this.ArrangedService.executeHTTP(this.apiUrl[3], {userName: i.userName})
                        .then((res: any) => {
                            let temp = JSON.parse(res['_body'])['User1'];
                            i.userNickname = temp.userNickname;
                            i.email = temp.email;
                            i.phone = temp.phone;
                        });
                }
                this.simpleOrderList = data;
            });
    }
    // 展开列表
    private boolOpen(expand: boolean, id: any) {
        if (expand) {
            let data = [];
            this.ArrangedService.executeHTTP(this.apiUrl[2], {id: id})
                .then((result: any) => {
                    const res = JSON.parse(result['_body'])['Order'];
                    data = res.orderDetails;
                    this.orderDetails[id] = data;
                    for (let d of data) {
                        for (let i = 0; i < d.lab.length; i++) {
                            this.ArrangedService.executeHTTP(this.apiUrl[4], {labId: d.lab[i]})
                                .then((re: any) => {
                                    const lab = JSON.parse(re['_body'])['lab'];
                                    this.lab[d.lab[i]] = lab;
                                });
                        }
                    }
                });
        }
        return expand;
    }
    private getDayByNum(num: number) {
        const array = ['日', '一', '二', '三', '四', '五', '六', '日'];
        return array[num];
    }
    // 修改志愿1
    private update(data: any) {
        const str = JSON.stringify(data);
        this._storage.set('order', str);
        this.router.navigate(['/arranged/edit']);
    }

    ngOnInit(): void {
        this._getData();
    }
}
