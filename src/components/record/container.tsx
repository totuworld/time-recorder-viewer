import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
// import 'normalize.css/normalize.css';
import '../../styles/style.css';

import debug from 'debug';
import * as luxon from 'luxon';
import { observer } from 'mobx-react';
import * as moment from 'moment';
import React from 'react';
import {
  Card, CardBody, CardFooter, CardTitle, Col, Container, Row
} from 'reactstrap';

import { DateRange, DateRangeInput } from '@blueprintjs/datetime';

import { EN_WORK_TYPE } from '../../models/time_record/interface/EN_WORK_TYPE';
import { ITimeRecordLogData } from '../../models/time_record/interface/ITimeRecordLogData';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../services/util';
import TimeRecordStore from '../../stores/TimeRecordStore';
import ChartBarStacked from '../chart/bar/Stacked';
import ChartBarStacked2, { IChartBarStacked2Props } from '../chart/bar/Stacked2';
import { IAfterRequestContext } from '../interface/IAfterRequestContext';

const log = debug('trv:recordContainer');
interface WorkStackedBarChart {
  new (): ChartBarStacked<{name: string, data: {REST: number, WORK: number, EMERGENCY: number}}>;
}
const WorkStackedBarChart = ChartBarStacked as WorkStackedBarChart;

const bgColor = [
  {targetKey: 'REST', color: '#ffc107'},
  {targetKey: 'WORK', color: '#63c2de'},
  {targetKey: 'EMERGENCY', color: '#f86c6b'}
];

interface IRecordContainerProps {
  userId: string;
  records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>;
  initialStartDate: string;
  initialEndDate: string;
}

interface IRecordContainerStates {
  startDate: Date;
  endDate: Date;
}

@observer
class RecordContainer extends React.Component<IRecordContainerProps, IRecordContainerStates> {
  private store: TimeRecordStore;

  public static async getInitialProps({
    req,
    res,
    match
  }: IAfterRequestContext<{ user_id: string }>) {
    log(match.params.user_id);
    log(!!req && !!req.config);
    let rbParam: RequestBuilderParams = { isProxy: true };
    if (!!req && !!req.config) {
      rbParam = { baseURI: req.config.getApiURI(), isProxy: false };
    }
    const today = moment().format('YYYY-MM-DD');
    let startDate = today;
    let endDate = today;
    if (!!req && !!req.query) {
      startDate = !!req.query['startDate'] ? req.query['startDate'] : today;
      endDate = !!req.query['endDate'] ? req.query['endDate'] : today;
    }
    const checkParams = {
      query: {
        userId: match.params.user_id,
        startDate,
        endDate,
      }
    };

    const rb = new TimeRecordRequestBuilder(rbParam);
    const action = new TimeRecord(rb);

    const actionResp = await action.findAll(
      checkParams,
      GetTimeRecordsJSONSchema,
    );
    
    return {
      userId: match.params.user_id,
      records: actionResp.type === EN_REQUEST_RESULT.SUCCESS ? actionResp.data : [],
      initialStartDate: startDate,
      initialEndDate: endDate,
    };
  }

  public constructor(props: IRecordContainerProps) {
    super(props);

    this.state = {
      startDate: moment(props.initialStartDate).toDate(),
      endDate: moment(props.initialEndDate).toDate(),
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.handleOnClickChartBar = this.handleOnClickChartBar.bind(this);
    this.getMultipleDayElement = this.getMultipleDayElement.bind(this);
    this.getSingleDayElement = this.getSingleDayElement.bind(this);
    this.store = new TimeRecordStore(props.records);
  }

  public onDatesChange([ startDate, endDate ]: DateRange) {
    const updateObj = {
      ...this.state,
    };
    if (!!startDate) {
      updateObj['startDate'] = startDate;
    }
    if (!!endDate) {
      updateObj['endDate'] = endDate;
    }
    this.setState(updateObj);
  }

  public async handleClosePopover() {
    if (this.store.isIdle === true) {
      await this.store.findTimeRecord(
        this.props.userId,
        moment(this.state.startDate).format('YYYY-MM-DD'),
        moment(this.state.endDate).format('YYYY-MM-DD'),
      );
    }
  }

  public handleOnClickChartBar(args: any) {
    const { activeLabel } = args;
    const day = moment(activeLabel, 'YYYYMMDD').format('YYYY-MM-DD');
    window.location.href = `/records/${this.props.userId}?startDate=${day}&endDate=${day}`;
  }

  public getMultipleDayElement() {
    const updateDatas = this.store.Records.length > 0 ? this.store.Records.map((mv) => {
      const dateStr = Object.keys(mv)[0];
      const data = {
        name: dateStr,
        data: { REST: 0, WORK: 0, EMERGENCY: 0 },
        timeObj: { REST: {}, WORK: {}, EMERGENCY: {} },
      };
      const workTime = TimeRecord.extractWorkTime(mv[dateStr]);
      const restTime = TimeRecord.extractRestTime(mv[dateStr]);
      const emergencyTime = TimeRecord.extractEmergencyTime(mv[dateStr]);
      data.data.WORK = workTime.time;
      data.timeObj.WORK = workTime.timeObj;
      data.data.REST = restTime.time;
      data.timeObj.REST = restTime.timeObj;
      data.data.EMERGENCY = emergencyTime.time;
      data.timeObj.EMERGENCY = emergencyTime.timeObj;
      return data;
    }) : [];
    const datasets: IChartBarStacked2Props = updateDatas.reduce(
      (acc, cur) => {
        const { name, data } = cur;
        acc.labels.push(name);
        acc.datasets[0].data.push(!!data.WORK ? data.WORK : 0);
        acc.datasets[1].data.push(!!data.REST ? data.REST : 0);
        acc.datasets[2].data.push(!!data.EMERGENCY ? data.EMERGENCY : 0);
        return acc;
      },
      { labels: new Array<string>(), datasets: [
        { label: 'WORK', data: new Array<number>(), backgroundColor: bgColor[1].color },
        { label: 'REST', data: new Array<number>(), backgroundColor: bgColor[0].color },
        { label: 'EMERGENCY', data: new Array<number>(), backgroundColor: bgColor[2].color },
      ] });
    const timeObjs = updateDatas.map((mv) => mv.timeObj);
    const timeLawRestObjs = updateDatas.filter((fv) => fv.data.WORK >= 8)
      .map((mv) => { const updateObj = {...mv.timeObj, REST: { hours: 1 } }; return updateObj; });
    const totalWorkTimeStr = Util.reduceDurationObject(timeObjs, EN_WORK_TYPE.WORK).toFormat('hh:mm:ss');
    const totalLawRestTimeStr = Util.reduceDurationObject(timeLawRestObjs, EN_WORK_TYPE.REST).toFormat('hh:mm:ss');
    const totalRestTimeStr = Util.reduceDurationObject(timeObjs, EN_WORK_TYPE.REST).toFormat('hh:mm:ss');
    const totalEmergencyTimeStr = Util.reduceDurationObject(timeObjs, EN_WORK_TYPE.EMERGENCY).toFormat('hh:mm:ss');
    // const calWorkTime = totalWorkTime - totalRestTime - totalLawRestTime + totalEmergencyTime;
    let calWorkTimeObj = Util.calTimeObj(
      Util.reduceTimeObj(timeObjs, EN_WORK_TYPE.WORK),
      Util.reduceTimeObj(timeObjs, EN_WORK_TYPE.EMERGENCY));
    calWorkTimeObj = Util.calTimeObj(
      calWorkTimeObj,
      Util.reduceTimeObj(timeObjs, EN_WORK_TYPE.REST),
      'minus');
    calWorkTimeObj = Util.calTimeObj(
      calWorkTimeObj,
      Util.reduceTimeObj(timeLawRestObjs, EN_WORK_TYPE.REST),
      'minus');
    const calWorkTimeStr = luxon.Duration.fromObject(calWorkTimeObj).toFormat('hh:mm:ss');
    
    let range = this.state.startDate === this.state.endDate ? 1 :
      moment(this.state.endDate).diff(moment(this.state.startDate), 'days') + 1;
    if (range >= 7) {
      const weekCount = (range - (range % 7)) / 7;
      range -= (weekCount * 2);
    }
    const overTimeStr = luxon.Duration.fromObject(Util.calTimeObj(
      calWorkTimeObj,
      { hours: 8 * range },
      'minus')).toFormat('hh:mm:ss');
    log(datasets.datasets[0].data);
    return (
      <>
        <Card>
          <CardBody>
            <CardTitle className="mb-0">Work Log Chart</CardTitle>
              <div className="chart-wrapper">
                <ChartBarStacked2
                  labels={datasets.labels}
                  datasets={datasets.datasets}
                />
              </div>
          </CardBody>
          <CardFooter>
            <Row>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-primary">
                  <div className="text-muted">{calWorkTimeStr}</div>
                  <div>근무시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-danger">
                  <div className="text-muted">{overTimeStr}</div>
                  <div>초과근무시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-info">
                  <div className="text-muted">{totalWorkTimeStr}</div>
                  <div>일한시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-warning">
                  <div className="text-muted">{totalEmergencyTimeStr}</div>
                  <div>긴급대응시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-info">
                  <div className="text-muted">{totalRestTimeStr}</div>
                  <div>휴식시간</div>
                </div>
              </Col>
              <Col md={true} className="mb-sm-2 mb-0">
                <div className="callout callout-info">
                  <div className="text-muted">{totalLawRestTimeStr}</div>
                  <div>법정 휴식시간</div>
                </div>
              </Col>
            </Row>
          </CardFooter>
        </Card>
      </>
    );
  }

  public getSingleDayElement() {
    // piechart 추가 (https://jsfiddle.net/alidingling/hqnrgxpj/)
    // log table 추가
    return (
      <div>
        test
      </div>
    );
  }

  public render() {
    const diffDay = Math.abs(moment(this.state.startDate).diff(moment(this.state.endDate), 'days'));
    const renderElement = diffDay > 0 ?
      this.getMultipleDayElement() : this.getSingleDayElement();
    return (
      <div className="app">
        <Container>
          <DateRangeInput
            shortcuts={false}
            allowSingleDayRange={true}
            formatDate={(date) => !!date ? moment(date).format('YYYY-MM-DD') : ''}
            onChange={this.onDatesChange}
            parseDate={(str) => new Date(str)}
            value={[this.state.startDate, this.state.endDate]}
            closeOnSelection={false}
            popoverProps={{onClosed: this.handleClosePopover}}
            minDate={new Date('2018-07-01')}
            maxDate={new Date()}
          />
          {renderElement}
        </Container>
      </div>
    );
  }
}

export default RecordContainer;
