import React from "react";
import { Pagination, Icon, Button } from "semantic-ui-react";

class Paginate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: this.props.page,
      total: this.props.total,
      onClick: this.props.onClick,
      type: this.props.type
    };
  }

  render = () => (
    <React.Fragment>
      {this.props.type === "number" ? (
        <React.Fragment>
          <Pagination
            defaultActivePage={this.props.page}
            ellipsisItem={{
              content: <Icon name="ellipsis horizontal" />,
              icon: true
            }}
            firstItem={null}
            lastItem={null}
            prevItem={{ content: <Icon name="angle left" />, icon: true }}
            nextItem={{ content: <Icon name="angle right" />, icon: true }}
            totalPages={this.props.total}
            onClick={e => {
              let check = e.target;
              if (check.attributes.value !== undefined) {
                let page = e.target.attributes.value.value;
                this.props.onClick(page);
              } else {
                let page = check.parentElement.attributes.value.value;
                this.props.onClick(page);
              }
            }}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div>
            <Button
              icon="angle left"
              basic
              onClick={() => {
                if (this.props.page > 1) {
                  this.props.onClick(this.props.page - 1);
                }
              }}
            />
            <Button
              icon="angle right"
              basic
              onClick={() => {
                if (this.props.page < this.props.total) {
                  this.props.onClick(this.props.page + 1);
                }
              }}
            />
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export { Paginate };

// offset is what next index do I need to return it.
// on clicking next or previous get the current offset and increment them
// on clicking a number, get the current offset and multiply it with the number - 1  and do + 1
