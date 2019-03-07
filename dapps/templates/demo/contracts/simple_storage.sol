pragma solidity ^0.5.0;

contract SimpleStorage {
  uint public storedData;

  constructor(uint initialValue) public {
    storedData = initialValue;
  }

  function get() public view returns (uint retVal) {
    return storedData;
  }

  event DidGet(uint _x);

  function myGetter() public returns (uint retVal) {
    emit DidGet(storedData);
    return storedData;
  }

  function getString() public pure returns (bytes1 retVal) {
    return "a";
  }

  function set(uint x) public {
    storedData = x;
  }

  event DidSet(uint _x);

  function mySetter(uint x) public {
    storedData = x;
    emit DidSet(x);
  }

  function foo(uint g, uint h, uint i, uint j, uint k, uint l) public view returns (uint retVal) {
    return storedData + g + h + i + j + k + l;
  }

  function bar(uint g, uint howdy, uint i, uint jojojojo, uint kk, uint l) public pure returns (uint retVal) {
    return g + howdy + i + jojojojo + kk + l;
  }
}
