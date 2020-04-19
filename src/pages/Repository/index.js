/* eslint-disable react/prefer-stateless-function */
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import React, { Component } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueFilter, Pagination } from './styles';

export default class Repository extends Component {
  constructor() {
    super();
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      issuesState: 'open',
      page: 1,
    };
  }

  async componentDidMount() {
    const { match } = this.props;

    const { issuesState, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issuesState,
          per_page: 5,
          page,
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

    const { issuesState, page } = this.state;

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issuesState,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: response.data });
  }

  handleSelectChange = (e) => {
    this.setState({ issuesState: e.target.value });
  };

  handleNextPage = () => {
    const { page } = this.state;
    this.setState({ page: page + 1 });
  };

  handlePrevPage = () => {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  };

  render() {
    const { repository, issues, loading, issuesState, page } = this.state;

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
        <Pagination>
          <button
            type="button"
            disabled={page === 1}
            onClick={this.handlePrevPage}
          >
            <FaChevronLeft color="#fff" size={16} />
          </button>
          <button type="button" onClick={this.handleNextPage}>
            <FaChevronRight color="#fff" size={16} />
          </button>
        </Pagination>
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
