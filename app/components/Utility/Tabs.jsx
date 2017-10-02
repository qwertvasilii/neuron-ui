import React, {PropTypes} from "react";
import Translate from "react-translate-component";
import cnames from "classnames";
import { connect } from "alt-react";
import SettingsActions from "actions/SettingsActions";
import SettingsStore from "stores/SettingsStore";

/**
 *  Renders a tab layout, handling switching and optionally persists the currently open tab using the SettingsStore
 *
 *  props:
 *     setting: unique name to be used to remember the active tab of this tabs layout,
 *     tabsClass: optional classes for the tabs container div
 *     contentClass: optional classes for the content container div
 *
 *  Usage:
 *
 *  <Tabs setting="mySetting">
 *      <Tab title="locale.string.title1">Tab 1 content</Tab>
 *      <Tab title="locale.string.title2">Tab 2 content</Tab>
 *  </Tabs>
 *
 */

class Tab extends React.Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        changeTab: PropTypes.func,
        isActive: PropTypes.bool.isRequired,
        index: PropTypes.number.isRequired,
        className: PropTypes.string
    };

    static defaultProps = {
        isActive: false,
        index: 0,
        className: ""
    };

    render() {
        let {isActive, index, changeTab, title, className, disabled} = this.props;
        let c = cnames({"is-active": isActive}, className);

        return (
            <li className={c} onClick={!disabled ? changeTab.bind(this, index) : null}>
                <a>
                    {title.indexOf(".") > 0 ? <Translate className="tab-title" content={title} /> : <span className="tab-title">{title}</span>}
                    {this.props.subText ? <div className="tab-subtext">{this.props.subText}</div> : null}
                </a>
            </li>
        );
    }
}

class Tabs extends React.Component {

    static propTypes = {
        setting: PropTypes.string,
        defaultActiveTab: PropTypes.number,
        segmented: PropTypes.bool
    };

    static defaultProps = {
        active: 0,
        defaultActiveTab: 0,
        segmented: true,
        contentClass: ""
    };

    constructor(props) {
        super();
        this.state = {
            activeTab: props.setting ? props.viewSettings.get(props.setting, props.defaultActiveTab) : props.defaultActiveTab
        };
    }

    componentWillReceiveProps(nextProps) {
        let nextSetting = nextProps.viewSettings.get(nextProps.setting);
        if (nextSetting !== this.props.viewSettings.get(this.props.setting)) {
            this.setState({
                activeTab: nextSetting
            });
        }
    }

    _changeTab(value) {
        // Persist current tab if desired
        if (this.props.setting) {
            SettingsActions.changeViewSetting({
                [this.props.setting]: value
            });
        }
        this.setState({activeTab: value});
    }

    render() {
        let {children, contentClass, tabsClass, style, segmented} = this.props;

        let activeContent = null;

        let tabIndex = [];
        let tabs = React.Children.map(children, (child, index) => {
            if (!child) {
                return null;
            }
            let isActive = index === this.state.activeTab;
            if (isActive) {
                activeContent = child.props.children;
            }

            return React.cloneElement(child, {isActive: isActive, changeTab: this._changeTab.bind(this), index: index} );
        }).filter(a => {
            if (a) {
                tabIndex.push(a.props.index);
            }
            return a !== null;
        });

        if (!activeContent) {
            activeContent = tabs[0].props.children;
        }

        return (
            <div className={this.props.className}>
                <div className="service-selector">
                    <ul style={style} className={cnames("button-group no-margin", tabsClass, {segmented})}>
                        {tabs}
                    </ul>
                </div>
                <div className={contentClass + " tab-content"} >
                    {activeContent}
                </div>

            </div>
        );
    }
}

Tabs = connect(Tabs, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {viewSettings: SettingsStore.getState().viewSettings};
    }
});

export {Tabs, Tab};
