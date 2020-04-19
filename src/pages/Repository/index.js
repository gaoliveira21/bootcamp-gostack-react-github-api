/* eslint-disable react/prefer-stateless-function */
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import React, { Component } from 'react';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueFilter } from './styles';

export default class Repository extends Component {
  constructor() {
    super();
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      issuesState: 'open',
    };
  }

  async componentDidMount() {
    const { match } = this.props;

    const { issuesState } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issuesState,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const { issuesState } = this.state;

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issuesState,
        per_page: 5,
      },
    });

    this.setState({ issues: response.data });
  }

  handleSelectChange = (e) => {
    this.setState({ issuesState: e.target.value });
  };

  render() {
    const { repository, issues, loading, issuesState } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <IssueFilter>
            <strong>Filtrar:</strong>
            <select
              id="issues-state"
              value={issuesState}
              onChange={this.handleSelectChange}
            >
              <option value="open">Em aberto</option>
              <option value="all">Todas</option>
              <option value="closed">Fechadas</option>
            </select>
          </IssueFilter>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: propTypes.shape({
    params: propTypes.shape({
      repository: propTypes.string,
    }),
  }).isRequired,
};
